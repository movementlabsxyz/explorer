import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {standardizeAddress} from "../../utils";
import {InputViewFunctionData} from "@aptos-labs/ts-sdk";
import {useGetAccountResources} from "./useGetAccountResources";

const MOVE_FA_ADDRESS_SHORT = "0xa";

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

interface CoinStoreResource {
  type: string;
  data: {
    coin: {
      value: string;
    };
    frozen: boolean;
  };
}

export function useGetAccountCoins(address: string) {
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  const {data: resources, isLoading, error} = useGetAccountResources(address);

  return useQuery<UnifiedCoinBalance[], ResponseError>({
    queryKey: ["coinQuery", address, resources],
    enabled: !isLoading && !error,
    queryFn: async (): Promise<UnifiedCoinBalance[]> => {
      const result: UnifiedCoinBalance[] = [];

      if (!resources) return result;

      const coinStoreResources = resources.filter((resource) =>
        resource.type.startsWith("0x1::coin::CoinStore<"),
      ) as CoinStoreResource[];

      for (const resource of coinStoreResources) {
        const match = resource.type.match(/0x1::coin::CoinStore<(.+)>/);
        if (!match) continue;

        const coinType = match[1];
        const balance = parseInt(resource.data.coin.value, 10);

        if (balance > 0) {
          result.push({
            amount_v2: balance,
            asset_type_v2: coinType,
            metadata: {
              name: coinType.split("::").pop() || "Unknown",
              decimals: 8,
              symbol: coinType.split("::").pop() || "Unknown",
              token_standard: "v1",
            },
            is_v1_coin: true,
          });
        }
      }

      let faMoveBal = 0;
      try {
        const payload: InputViewFunctionData = {
          function: "0x1::primary_fungible_store::balance",
          typeArguments: ["0x1::object::ObjectCore"],
          functionArguments: [standardizedAddress, MOVE_FA_ADDRESS_SHORT],
        };
        const result_fa = await state.sdk_v2_client.view<[string]>({payload});
        faMoveBal = parseInt(result_fa[0] || "0", 10);
      } catch {
        faMoveBal = 0;
      }

      if (faMoveBal > 0) {
        result.push({
          amount_v2: faMoveBal,
          asset_type_v2: MOVE_FA_ADDRESS_SHORT,
          metadata: {
            name: "Move Coin",
            decimals: 8,
            symbol: "MOVE",
            token_standard: "v2",
          },
          is_v1_coin: false,
        });
      }

      return result;
    },
  });
}
