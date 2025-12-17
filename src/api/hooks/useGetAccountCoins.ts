import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {standardizeAddress} from "../../utils";

const FA_BALANCES_QUERY = `
    query FungibleAssetBalances($owner_address: String, $limit: Int, $offset: Int) {
        current_fungible_asset_balances(
            where: {owner_address: {_eq: $owner_address}}
            limit: $limit
            offset: $offset
        ) {
            amount_v1
            asset_type_v1
            amount_v2
            asset_type_v2
            metadata {
                name
                decimals
                symbol
                token_standard
            }
        }
    }
`;


const COIN_COUNT_QUERY = `
    query GetFungibleAssetCount($address: String) {
        current_fungible_asset_balances_aggregate(
            where: {owner_address: {_eq: $address}}
            order_by: {amount: desc}
        ) {
            aggregate {
                count
            }
        }
    }
`;

export function useGetAccountCoinCount(address: string) {
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  return useQuery<number, ResponseError>({
    queryKey: ["coinCount", address],
    // TODO type this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      const response = await state.sdk_v2_client?.queryIndexer<{
        current_fungible_asset_balances_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: COIN_COUNT_QUERY,
          variables: {
            address: standardizedAddress,
          },
        },
      });

      return response?.current_fungible_asset_balances_aggregate.aggregate.count;
    },
  });
}

type FaBalance = {
  amount_v1?: number;
  asset_type_v1?: string;
  amount_v2?: number;
  asset_type_v2?: string;
  metadata: {
    name: string;
    decimals: number;
    symbol: string;
    token_standard: string;
  };
};

export type UnifiedCoinBalance = {
  amount_v2: number;
  asset_type_v2: string;
  metadata: {
    name: string;
    decimals: number;
    symbol: string;
    token_standard: string;
  };
  is_v1_coin?: boolean;
};

export function useGetAccountCoins(address: string) {
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  // Get count first
  const count = useGetAccountCoinCount(address);

  // Now retrieve all the coins
  const PAGE_SIZE = 100;

  return useQuery<UnifiedCoinBalance[], ResponseError>({
    queryKey: ["coinQuery", address, count.data],
    // TODO: Type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      let faBalances: FaBalance[] = [];

      // Fetch balances from current_fungible_asset_balances table
      // This table tracks BOTH v1 Coins and v2 FAs:
      // - v1 Coins: have amount_v1/asset_type_v1 populated, token_standard = "v1"
      // - v2 FAs: have amount_v2/asset_type_v2 populated, token_standard = "v2"
      if (!count.data || count.data === 0) {
        faBalances = [];
      } else {
        // TODO: make the UI paginate this, rather than query all at once
        const promises = [];
        for (let i = 0; i < count.data; i += PAGE_SIZE) {
          promises.push(
            state.sdk_v2_client.queryIndexer<{
              current_fungible_asset_balances: FaBalance[];
            }>({
              query: {
                query: FA_BALANCES_QUERY,
                variables: {
                  owner_address: standardizedAddress,
                  limit: PAGE_SIZE,
                  offset: i,
                },
              },
            }),
          );
        }

        const responses = await Promise.all(promises);
        faBalances = responses.flatMap(
          (r) => r.current_fungible_asset_balances,
        );
      }

      return processCoinsData(faBalances);
    },
  });
}

function processCoinsData(faBalances: FaBalance[]): UnifiedCoinBalance[] {
  const result: UnifiedCoinBalance[] = [];

  // Process balance records from current_fungible_asset_balances table.
  // Each record can have:
  // - amount_v1/asset_type_v1: Balance held in v1 CoinStore (coin format)
  // - amount_v2/asset_type_v2: Balance held in v2 FungibleStore (FA format)
  //
  // Note: token_standard in metadata refers to the TOKEN's metadata standard,
  // NOT whether the user holds it as Coin or FA. MOVE has token_standard "v1"
  // but users can hold it in either CoinStore (v1) or FungibleStore (v2).
  //
  // We determine Coin vs FA based on WHICH amount field has the balance:
  // - amount_v1 populated (non-null, non-zero) → v1 Coin (CoinStore)
  // - amount_v2 populated → v2 FA (FungibleStore)
  for (const fa of faBalances) {
    const hasV1Balance = fa.amount_v1 != null && fa.amount_v1 > 0;
    const hasV2Balance = fa.amount_v2 != null && fa.amount_v2 > 0;

    if (hasV2Balance && fa.asset_type_v2 != null) {
      // User has FA balance (stored in FungibleStore)
      result.push({
        amount_v2: fa.amount_v2!,
        asset_type_v2: fa.asset_type_v2,
        metadata: fa.metadata,
        is_v1_coin: false, // FA, not Coin
      });
    }

    if (hasV1Balance && fa.asset_type_v1 != null) {
      // User has Coin balance (stored in CoinStore)
      result.push({
        amount_v2: fa.amount_v1!,
        asset_type_v2: fa.asset_type_v1,
        metadata: fa.metadata,
        is_v1_coin: true, // Coin, not FA
      });
    }

    // Handle edge case: record has asset info but zero/null in both amounts
    // (shouldn't happen in practice, but fallback to v2 format if available)
    if (!hasV1Balance && !hasV2Balance) {
      if (fa.asset_type_v2 != null) {
        result.push({
          amount_v2: fa.amount_v2 ?? 0,
          asset_type_v2: fa.asset_type_v2,
          metadata: fa.metadata,
          is_v1_coin: false,
        });
      } else if (fa.asset_type_v1 != null) {
        result.push({
          amount_v2: fa.amount_v1 ?? 0,
          asset_type_v2: fa.asset_type_v1,
          metadata: fa.metadata,
          is_v1_coin: true,
        });
      }
    }
  }

  return result;
}
