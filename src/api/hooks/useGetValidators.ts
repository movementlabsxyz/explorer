import { useEffect, useState } from "react";
import { useGetValidatorSet } from "./useGetValidatorSet";
// import {Network} from "../../constants";
// import {standardizeAddress} from "../../utils";

// const MAINNET_VALIDATORS_DATA_URL =
//   "https://storage.googleapis.com/aptos-mainnet/explorer/validator_stats_v2.json?cache-version=0";

// const TESTNET_VALIDATORS_DATA_URL =
//   "https://storage.googleapis.com/aptos-testnet/explorer/validator_stats_v2.json?cache-version=0";

// const PREVIEWNET_VALIDATORS_DATA_URL =
//   "https://aptos-analytics-data-previewnet.s3.amazonaws.com/validator_stats_v1.json";

export interface ValidatorData {
  owner_address: string;
  operator_address: string;
  voting_power: string;
  governance_voting_record: string;
  last_epoch: number;
  last_epoch_performance: string;
  liveness: number;
  rewards_growth: number;
  location_stats?: GeoData;
  apt_rewards_distributed: number;
}

export interface GeoData {
  peer_id: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region: string;
  epoch: number;
}

// JSON validator stats loading is disabled until Movement has validator stats JSON files available
// This includes performance metrics: rewards_growth, last_epoch_performance, liveness, location_stats, etc.
function useGetValidatorsRawData() {
  // Always return empty array - JSON stats loading is disabled
  return { validatorsRawData: [] };
}

export function useGetValidators() {
  const { activeValidators } = useGetValidatorSet();
  const { validatorsRawData } = useGetValidatorsRawData();

  const [validators, setValidators] = useState<ValidatorData[]>([]);

  useEffect(() => {
    if (activeValidators.length > 0 && validatorsRawData.length > 0) {
      const validatorsCopy = JSON.parse(JSON.stringify(validatorsRawData));

      validatorsCopy.forEach((validator: ValidatorData) => {
        const activeValidator = activeValidators.find(
          (activeValidator) => activeValidator.addr === validator.owner_address,
        );
        validator.voting_power = activeValidator?.voting_power ?? "0";
      });

      setValidators(validatorsCopy);
    }
  }, [activeValidators, validatorsRawData]);

  return { validators };
}
