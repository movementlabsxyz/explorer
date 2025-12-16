import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {CoinDescriptionPlusAmount, CoinsTable} from "../Components/CoinsTable";
import {
  CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import {findCoinData} from "../../Transaction/Tabs/BalanceChangeTab";
import {useGetAccountCoins} from "../../../api/hooks/useGetAccountCoins";
import {coinOrderIndex} from "../../utils";

type TokenTabsProps = {
  address: string;
};

export default function CoinsTab({address}: TokenTabsProps) {
  const {data: coinData} = useGetCoinList();

  const {isLoading, error, data} = useGetAccountCoins(address);

  if (isLoading) {
    return null;
  }

  if (error) {
    console.error(error);
    return null;
  }

  const coins = data ?? [];

  if (coins.length === 0) {
    return <EmptyTabContent />;
  }

  function parse_coins(): CoinDescriptionPlusAmount[] {
    if (!coins || coins.length <= 0) {
      return [];
    }
    return coins
      .filter((coin) => Boolean(coin.metadata))
      .map((coin): CoinDescriptionPlusAmount => {
        const foundCoin = findCoinData(coinData?.data ?? [], coin.asset_type_v2);

        // Infer token standard from asset_type_v2 format
        // If it contains "::", it's a Coin (v1), otherwise it's an FA address (v2)
        const inferredTokenStandard = coin.asset_type_v2.includes("::") ? "v1" : "v2";

        if (!foundCoin) {
          // Minimally, return the information we do know
          return {
            name: coin.metadata.name,
            amount: coin.amount_v2,
            decimals: coin.metadata.decimals,
            symbol: coin.metadata.symbol,
            assetType: coin.asset_type_v2,
            assetVersion: inferredTokenStandard,
            chainId: 0,
            tokenAddress:
              inferredTokenStandard === "v1" ? coin.asset_type_v2 : null,
            faAddress:
              inferredTokenStandard === "v2" ? coin.asset_type_v2 : null,
            bridge: null,
            panoraSymbol: null,
            logoUrl: "",
            websiteUrl: null,
            category: "N/A",
            isInPanoraTokenList: false,
            isBanned: false,
            panoraOrderIndex: 20000000,
            coinGeckoId: null,
            coinMarketCapId: null,
            tokenStandard: inferredTokenStandard,
            usdPrice: null,
            panoraTags: [],
            panoraUI: false,
            native: false,
            usdValue: 0,
          };
        } else {
          // Otherwise, use the stuff found in the lookup
          return {
            ...foundCoin,
            amount: coin.amount_v2,
            tokenStandard: inferredTokenStandard,
            usdValue: foundCoin.usdPrice
              ? Math.round(
                  100 *
                    (Number.EPSILON +
                      (parseFloat(foundCoin.usdPrice) * coin.amount_v2) /
                        10 ** coin.metadata.decimals),
                ) / 100
              : null,
            assetType: coin.asset_type_v2,
            assetVersion: inferredTokenStandard,
          };
        }
      })
      .sort((a: CoinDescriptionPlusAmount, b: CoinDescriptionPlusAmount) => {
        return (
          coinOrderIndex(a as CoinDescription) -
          coinOrderIndex(b as CoinDescription)
        );
      })
      .sort((a: CoinDescriptionPlusAmount, b: CoinDescriptionPlusAmount) => {
        return (b.usdValue ?? -1) - (a.usdValue ?? -1);
      });
  }

  return <CoinsTable coins={parse_coins()} />;
}
