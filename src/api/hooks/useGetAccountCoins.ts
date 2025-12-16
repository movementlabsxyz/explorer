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

const COIN_BALANCES_QUERY = `
    query CoinBalances($owner_address: String) {
        coin_balances(
            where: {owner_address: {_eq: $owner_address}}
        ) {
            coin_type
            amount
        }
    }
`;

const COIN_METADATA_QUERY = `
    query CoinMetadata($coin_types: [String!]) {
        fungible_asset_metadata(
            where: {asset_type: {_in: $coin_types}}
        ) {
            asset_type
            name
            decimals
            symbol
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

type CoinBalance = {
  coin_type: string;
  amount: string;
};

type CoinMetadata = {
  asset_type: string;
  name: string;
  decimals: number;
  symbol: string;
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
      let coinBalances: CoinBalance[] = [];

      // Fetch v2 FA balances
      if (!count.data || count.data === 0) {
        // No FA balances, but still might have v1 coins
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

      // Fetch v1 coin balances separately (optional)
      try {
        const coinResponse = await state.sdk_v2_client.queryIndexer<{
          coin_balances: CoinBalance[];
        }>({
          query: {
            query: COIN_BALANCES_QUERY,
            variables: {
              owner_address: standardizedAddress,
            },
          },
        });
        coinBalances = coinResponse.coin_balances || [];
      } catch (error) {
        console.warn('Failed to fetch v1 coin balances:', error);
        // Continue without v1 balances
        coinBalances = [];
      }

      console.log('Fetched balances:', {faCount: faBalances.length, coinCount: coinBalances.length});

      return processCoinsData(faBalances, coinBalances, state);
    },
  });
}

async function processCoinsData(
  faBalances: FaBalance[],
  coinBalances: CoinBalance[],
  state: any,
): Promise<UnifiedCoinBalance[]> {
  const result: UnifiedCoinBalance[] = [];

  // Process FA balance records - they can contain either v1 or v2 data
  // All data from FA table should be marked as FA (is_v1_coin: false)
  for (const fa of faBalances) {
    // Check if this is v1 or v2 data
    if (fa.amount_v2 !== null && fa.asset_type_v2 !== null) {
      // v2 FA
      result.push({
        amount_v2: fa.amount_v2,
        asset_type_v2: fa.asset_type_v2,
        metadata: fa.metadata,
        is_v1_coin: false,
      });
    } else if (fa.amount_v1 !== null && fa.asset_type_v1 !== null) {
      // v1 format stored in FA table (still an FA, not a Coin)
      result.push({
        amount_v2: fa.amount_v1,
        asset_type_v2: fa.asset_type_v1,
        metadata: fa.metadata,
        is_v1_coin: false, // Changed to false since it's from FA table
      });
    }
  }

  // Group and aggregate v1 coin balances by coin_type
  const coinBalanceMap = new Map<string, number>();
  for (const coin of coinBalances) {
    const currentAmount = coinBalanceMap.get(coin.coin_type) || 0;
    coinBalanceMap.set(coin.coin_type, currentAmount + parseInt(coin.amount));
  }

  // Fetch metadata for v1 coins if needed
  const coinTypes = Array.from(coinBalanceMap.keys());
  if (coinTypes.length > 0) {
    try {
      const metadataResponse = await state.sdk_v2_client.queryIndexer<{
        fungible_asset_metadata: CoinMetadata[];
      }>({
        query: {
          query: COIN_METADATA_QUERY,
          variables: {
            coin_types: coinTypes,
          },
        },
      });

      const metadataMap = new Map<string, CoinMetadata>(
        metadataResponse.fungible_asset_metadata.map((m: CoinMetadata) => [m.asset_type, m]),
      );

      // Add v1 coin balances with metadata
      for (const [coinType, amount] of coinBalanceMap.entries()) {
        const metadata: CoinMetadata | undefined = metadataMap.get(coinType);
        result.push({
          amount_v2: amount,
          asset_type_v2: coinType,
          metadata: {
            name: metadata ? metadata.name : (coinType.split("::").pop() || coinType),
            decimals: metadata ? metadata.decimals : 8,
            symbol: metadata ? metadata.symbol : "",
            token_standard: "v1",
          },
          is_v1_coin: true,
        });
      }
    } catch (error) {
      console.error("Error fetching coin metadata:", error);
      // Fallback: add coins without metadata
      for (const [coinType, amount] of coinBalanceMap.entries()) {
        result.push({
          amount_v2: amount,
          asset_type_v2: coinType,
          metadata: {
            name: coinType.split("::").pop() || coinType,
            decimals: 8,
            symbol: "",
            token_standard: "v1",
          },
          is_v1_coin: true,
        });
      }
    }
  }

  return result;
}
