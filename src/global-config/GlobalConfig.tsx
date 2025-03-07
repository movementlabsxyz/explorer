import {AptosClient, IndexerClient} from "aptos";
import React, {useMemo, useState} from "react";
import {
  FeatureName,
  NetworkName,
  defaultNetworkName,
  getApiKey,
  networks,
} from "../constants";
import {
  getSelectedFeatureFromLocalStorage,
  useFeatureSelector,
} from "./feature-selection";
import {useNetworkSelector} from "./network-selection";
import {getGraphqlURI} from "../api/hooks/useGraphqlClient";
import {Aptos, AptosConfig, NetworkToNetworkName} from "@aptos-labs/ts-sdk";

const HEADERS = {
  "x-indexer-client": "movement-explorer",
};

export type GlobalState = {
  /** actual state */
  readonly feature_name: FeatureName;
  /** derived from external state ?network=<network> query parameter - e.g. devnet */
  readonly network_name: NetworkName;
  /** derived from network_name - url to connect to network */
  readonly network_value: string;
  /** derived from network_value */
  readonly aptos_client: AptosClient;
  /** derived from network_value */
  readonly indexer_client?: IndexerClient;
  /** derived from network_value */
  readonly sdk_v2_client: Aptos;
  readonly isWalletConnectModalOpen: boolean;
};

type GlobalActions = {
  selectFeature: ReturnType<typeof useFeatureSelector>[1];
  selectNetwork: ReturnType<typeof useNetworkSelector>[1];
  setWalletConnectModalOpen: (arg: boolean) => void;
};

function deriveGlobalState({
  feature_name,
  network_name,
  isWalletConnectModalOpen,
}: {
  feature_name: FeatureName;
  network_name: NetworkName;
  isWalletConnectModalOpen: boolean;
}): GlobalState {
  const indexerUri = getGraphqlURI(network_name);
  const apiKey = getApiKey(network_name);
  let indexerClient = undefined;
  if (indexerUri) {
    indexerClient = new IndexerClient(indexerUri, {HEADERS, TOKEN: apiKey});
  }
  return {
    feature_name,
    network_name,
    isWalletConnectModalOpen,
    network_value: networks[network_name],
    aptos_client: new AptosClient(networks[network_name], {
      HEADERS,
      TOKEN: apiKey,
    }),
    indexer_client: indexerClient,
    sdk_v2_client: new Aptos(
      new AptosConfig({
        network: NetworkToNetworkName[network_name],
        fullnode: networks[network_name],
        indexer: indexerUri,
        clientConfig: {
          HEADERS,
          API_KEY: apiKey,
        },
      }),
    ),
  };
}

const initialGlobalState = deriveGlobalState({
  feature_name: getSelectedFeatureFromLocalStorage(),
  network_name: defaultNetworkName,
  isWalletConnectModalOpen: false,
});

export const GlobalStateContext = React.createContext(initialGlobalState);
export const GlobalActionsContext = React.createContext({} as GlobalActions);

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedFeature, selectFeature] = useFeatureSelector();
  const [selectedNetwork, selectNetwork] = useNetworkSelector();
  const [isWalletConnectModalOpen, setWalletConnectModalOpen] = useState(false);
  const globalState: GlobalState = useMemo(
    () =>
      deriveGlobalState({
        feature_name: selectedFeature,
        network_name: selectedNetwork,
        isWalletConnectModalOpen,
      }),
    [selectedFeature, selectedNetwork, isWalletConnectModalOpen],
  );

  const globalActions = useMemo(
    () => ({
      selectFeature,
      selectNetwork,
      setWalletConnectModalOpen,
    }),
    [selectFeature, selectNetwork],
  );

  return (
    <GlobalStateContext.Provider value={globalState}>
      <GlobalActionsContext.Provider value={globalActions}>
        {children}
      </GlobalActionsContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () =>
  [
    React.useContext(GlobalStateContext),
    React.useContext(GlobalActionsContext),
  ] as const;

export const getCustomParameters = () => {};
