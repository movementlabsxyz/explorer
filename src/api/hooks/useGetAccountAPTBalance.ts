import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {getBalance} from "../index";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {useGetAccountCoins} from "./useGetAccountCoins";

export function useGetAccountAPTBalance(address: Types.Address) {
  const [state] = useGlobalState();
  // TODO: Convert all Types.Address to AccountAddress
  return useQuery<string, ResponseError>({
    queryKey: ["aptBalance", {address}, state.network_value],
    queryFn: () => getBalance(state.sdk_v2_client, address),
    retry: false,
  });
}

/**
 * Get unified MOVE balance (v1 Coin + v2 Fungible Asset)
 */
export function useGetUnifiedMOVEBalance(address: Types.Address) {
  const {data: coins, isLoading, error} = useGetAccountCoins(address);

  // Calculate total balance from coins data
  let totalBalance = "0";
  if (coins && !isLoading && !error) {
    let total = 0;

    // MOVE token identifiers
    const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
    const MOVE_FA_ADDRESS = "0x000000000000000000000000000000000000000000000000000000000000000a";

    for (const coin of coins) {
      if (coin.asset_type_v2 === APTOS_COIN || coin.asset_type_v2 === MOVE_FA_ADDRESS) {
        total += coin.amount_v2;
      }
    }

    totalBalance = total.toString();
  }

  return {
    data: totalBalance,
    isLoading,
    error,
  };
}
