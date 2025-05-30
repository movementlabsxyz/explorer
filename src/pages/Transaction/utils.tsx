import {Types} from "aptos";
import {standardizeAddress, tryStandardizeAddress} from "../../utils";
import {gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {TransactionTypeName} from "../../components/TransactionType";

export type TransactionCounterparty = {
  address: string;
  role: "receiver" | "smartContract";
};

// when the transaction counterparty is a "receiver",
//    the transaction is a user transfer (account A send money to account B)
// when the transaction counterparty is a "smartContract",
//    the transaction is a user interaction (account A interact with smart contract account B)
export function getTransactionCounterparty(
  transaction: Types.Transaction,
): TransactionCounterparty | undefined {
  if (transaction.type !== TransactionTypeName.User) {
    return undefined;
  }

  if (!("payload" in transaction)) {
    return undefined;
  }

  let payload: Types.TransactionPayload_EntryFunctionPayload;
  if (transaction.payload.type === "entry_function_payload") {
    payload =
      transaction.payload as Types.TransactionPayload_EntryFunctionPayload;
  } else if (
    transaction.payload.type === "multisig_payload" &&
    "transaction_payload" in transaction.payload &&
    transaction.payload.transaction_payload &&
    "type" in transaction.payload.transaction_payload &&
    transaction.payload.transaction_payload.type === "entry_function_payload"
  ) {
    payload = transaction.payload
      .transaction_payload as Types.TransactionPayload_EntryFunctionPayload;
  } else {
    return undefined;
  }

  // there are two scenarios that this transaction is an MOVE coin transfer:
  // 1. coins are transferred from account1 to account2:
  //    payload function is "0x1::coin::transfer" or "0x1::aptos_account::transfer_coins" and the first item in type_arguments is "0x1::aptos_coin::AptosCoin"
  // 2. coins are transferred from account1 to account2, and account2 is created upon transaction:
  //    payload function is "0x1::aptos_account::transfer" or "0x1::aptos_account::transfer_coins"
  // In both scenarios, the first item in arguments is the receiver's address, and the second item is the amount.

  const isCoinTransfer =
    payload.function === "0x1::coin::transfer" ||
    payload.function === "0x1::aptos_account::transfer_coins" ||
    payload.function === "0x1::aptos_account::transfer" ||
    payload.function === "0x1::aptos_account::fungible_transfer_only";
  const isPrimaryFaTransfer =
    payload.function === "0x1::primary_fungible_store::transfer";

  const isObjectTransfer = payload.function === "0x1::object::transfer";
  const isTokenV2MintSoulbound =
    payload.function === "0x4::aptos_token::mint_soul_bound";

  if (isCoinTransfer) {
    return {
      address: payload.arguments[0],
      role: "receiver",
    };
  }

  if (isPrimaryFaTransfer) {
    return {
      address: payload.arguments[1],
      role: "receiver",
    };
  }

  if (isObjectTransfer) {
    return {
      address: payload.arguments[1],
      role: "receiver",
    };
  }
  if (isTokenV2MintSoulbound) {
    return {
      address: payload.arguments[7],
      role: "receiver",
    };
  }

  const smartContractAddr = payload.function.split("::")[0];
  return {
    address: smartContractAddr,
    role: "smartContract",
  };
}

type ChangeData = {
  coin: {value: string};
  deposit_events: {
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  withdraw_events: {
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
};

export type BalanceChange = {
  address: string;
  amount: bigint;
  type: string;
  asset: {
    decimals: number;
    symbol: string;
    type: string;
    id: string;
  };
  known: boolean;
  isBanned?: boolean;
  logoUrl?: string;
  isInPanoraTokenList?: boolean;
};

function getBalanceMap(transaction: Types.Transaction) {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  // compile what fungible assets are updated in the transaction
  const fungibleAssetChangesByStore: Record<string, Types.WriteSetChange[]> =
    {};
  if ("changes" in transaction) {
    for (const change of transaction.changes) {
      if (
        change.type === "write_resource" ||
        change.type === "create_resource"
      ) {
        // track the store address and the changes to the store
        const changeWithData = change as {
          address: string;
          data: {type: string};
        };
        switch (changeWithData.data.type) {
          case "0x1::object::ObjectCore": // needed to determine owner of store
          case "0x1::fungible_asset::FungibleStore": // needed to determine FA type of store
            const addr = tryStandardizeAddress(changeWithData.address);
            if (!addr) {
              break;
            }
            if (fungibleAssetChangesByStore[addr] === undefined) {
              fungibleAssetChangesByStore[addr] = [];
            }

            fungibleAssetChangesByStore[addr].push(change);
            break;
        }
      }
    }
  }

  return events.reduce(
    (
      balanceMap: {
        [key: string]: {
          amountAfter: string;
          amount: bigint;
        };
      },
      event: Types.Event,
    ) => {
      const addr = standardizeAddress(event.guid.account_address);

      if (
        event.type === "0x1::coin::DepositEvent" ||
        event.type === "0x1::coin::WithdrawEvent"
      ) {
        // deposit and withdraw events could be other coins
        // here we only care about MOVE events
        if (isAptEvent(event, transaction)) {
          if (!balanceMap[addr]) {
            balanceMap[addr] = {amount: BigInt(0), amountAfter: ""};
          }

          const amount = BigInt(event.data.amount);

          if (event.type === "0x1::coin::DepositEvent") {
            balanceMap[addr].amount += amount;
          } else {
            balanceMap[addr].amount -= amount;
          }
        }
      } else if (
        event.type === "0x1::fungible_asset::Withdraw" ||
        event.type === "0x1::fungible_asset::Deposit"
      ) {
        // in order to add to balance map:
        // 1. must be FA store that shows up in the changes
        // 2. must be 0xa MOVE

        // verify #1
        const faEvent = event;
        const store = tryStandardizeAddress(faEvent.data.store);
        // skip if the address doesn't parse (shouldn't happen)
        if (!store) {
          return balanceMap;
        }

        const changes = fungibleAssetChangesByStore[store];
        // skip if no changes (shouldn't happen)
        if (!changes || changes.length === 0) {
          return balanceMap;
        }

        // verify #2
        const faStore = changes.find((change) => {
          const changeWithData = change as {
            type: string;
            data: {type: string};
          };
          return (
            changeWithData.data.type === "0x1::fungible_asset::FungibleStore" // change of this type has FA type
          );
        });

        // skip if no FA store (shouldn't happen)
        if (!faStore) {
          return balanceMap;
        }

        // TODO: fix any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const faStoreData = faStore as any as {
          data: {
            type: string;
            data: {
              balance: string;
              frozen: boolean;
              metadata: {inner: string};
            };
          };
        };

        // skip if not MOVE
        if (faStoreData.data.data.metadata.inner !== "0xa") {
          return balanceMap;
        }

        // Find the owner
        const object = changes.find((change) => {
          const changeWithData = change as {
            type: string;
            data: {type: string};
          };
          return changeWithData.data.type === "0x1::object::ObjectCore"; // change of this type has owner
        });

        // skip if no owner (shouldn't happen)
        if (!object) {
          return balanceMap;
        }

        // TODO: fix any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const objectData = object as any as {
          data: {
            type: string;
            data: {owner: string};
          };
        };
        const balanceOwner = tryStandardizeAddress(objectData.data.data.owner);
        // skip if the address doesn't parse (shouldn't happen)
        if (!balanceOwner) {
          return balanceMap;
        }

        // add the balance
        const amount = BigInt(event.data.amount);

        if (balanceMap[balanceOwner] === undefined) {
          balanceMap[balanceOwner] = {amount: BigInt(0), amountAfter: ""};
        }

        if (event.type === "0x1::fungible_asset::Deposit") {
          balanceMap[balanceOwner].amount += amount;
        } else {
          balanceMap[balanceOwner].amount -= amount;
        }
      }

      return balanceMap;
    },
    {},
  );
}

function getAptChangeData(
  change: Types.WriteSetChange,
): ChangeData | undefined {
  if (
    "address" in change &&
    "data" in change &&
    "type" in change.data &&
    change.data.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>" &&
    "data" in change.data
  ) {
    return JSON.parse(JSON.stringify(change.data.data)) as ChangeData;
  } else {
    return undefined;
  }
}

function isAptEvent(event: Types.Event, transaction: Types.Transaction) {
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  const aptEventChange = changes.filter((change) => {
    if (
      "address" in change &&
      change.address &&
      tryStandardizeAddress(change.address) ===
        tryStandardizeAddress(event.guid.account_address)
    ) {
      const data = getAptChangeData(change);
      if (data !== undefined) {
        const eventCreationNum = event.guid.creation_number;
        let changeCreationNum;
        if (event.type === "0x1::coin::DepositEvent") {
          changeCreationNum = data.deposit_events.guid.id.creation_num;
        } else if (event.type === "0x1::coin::WithdrawEvent") {
          changeCreationNum = data.withdraw_events.guid.id.creation_num;
        }
        if (eventCreationNum === changeCreationNum) {
          return change;
        }
      }
    }
  });

  return aptEventChange.length > 0;
}

interface TransactionResponse {
  fungible_asset_activities: Array<FungibleAssetActivity>;
}

export interface FungibleAssetActivity {
  amount: number;
  entry_function_id_str: string;
  gas_fee_payer_address?: string;
  is_frozen?: boolean;
  asset_type: string;
  event_index: number;
  owner_address: string;
  transaction_timestamp: string;
  transaction_version: number;
  type: string;
  storage_refund_amount: number;
  metadata: {
    asset_type: string;
    decimals: number;
    symbol: string;
  };
}

export function useTransactionBalanceChanges(txn_version: string) {
  const {loading, error, data} = useGraphqlQuery<TransactionResponse>(
    gql`
        query TransactionQuery($txn_version: String) {
            fungible_asset_activities(
                where: {transaction_version: {_eq: ${txn_version}}}
            ) {
                amount
                entry_function_id_str
                gas_fee_payer_address
                is_frozen
                asset_type
                event_index
                owner_address
                transaction_timestamp
                transaction_version
                type
                storage_refund_amount
                metadata {
                    asset_type
                    decimals
                    symbol
                }
            }
        }
    `,
    {variables: {txn_version}},
  );

  return {
    isLoading: loading,
    error,
    data,
  };
}

export function getCoinBalanceChangeForAccount(
  transaction: Types.Transaction,
  address: string,
): bigint {
  const accountToBalance = getBalanceMap(transaction);
  address = standardizeAddress(address);

  if (!accountToBalance.hasOwnProperty(address)) {
    return BigInt(0);
  }
  
  const accountBalance = accountToBalance[address];
  return accountBalance.amount;
}

export function getTransactionAmount(
  transaction: Types.Transaction,
): bigint | undefined {
  if (transaction.type !== TransactionTypeName.User) {
    return undefined;
  }

  const accountToBalance = getBalanceMap(transaction);

  const [totalDepositAmount, totalWithdrawAmount] = Object.values(
    accountToBalance,
  ).reduce(
    ([totalDepositAmount, totalWithdrawAmount]: bigint[], value) => {
      if (value.amount > 0) {
        totalDepositAmount += value.amount;
      }
      if (value.amount < 0) {
        totalWithdrawAmount -= value.amount;
      }
      return [totalDepositAmount, totalWithdrawAmount];
    },
    [BigInt(0), BigInt(0)],
  );

  return totalDepositAmount > totalWithdrawAmount
    ? totalDepositAmount
    : totalWithdrawAmount;
}
