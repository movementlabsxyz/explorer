import { useEffect, useState } from "react";
import { useGetValidatorSet } from "./useGetValidatorSet";
import { useGlobalState } from "../../global-config/GlobalConfig";

const MAINNET_VALIDATORS_DATA_URL =
  "https://storage.googleapis.com/explorer_stats/mainnet_epoch_stats_new_testing.json";

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

function useGetValidatorsRawData() {
  const [state] = useGlobalState();
  const [validatorsRawData, setValidatorsRawData] = useState<ValidatorData[]>([]);

  useEffect(() => {
    // Only fetch JSON stats for mainnet
    if (state.network_name !== "mainnet") {
      setValidatorsRawData([]);
      return;
    }

    const fetchData = async () => {
      try {
        // Add timestamp to bust cache without triggering CORS preflight
        const url = `${MAINNET_VALIDATORS_DATA_URL}?t=${Date.now()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ValidatorData[] = await response.json();

        // Filter out validators with null/missing last_epoch_performance
        const filteredData = data.filter(
          (validator) => validator.last_epoch_performance !== null &&
                         validator.last_epoch_performance !== undefined &&
                         validator.last_epoch_performance !== ""
        );

        setValidatorsRawData(filteredData);
      } catch (e) {
        console.error("Failed to fetch validator stats:", e);
        setValidatorsRawData([]);
      }
    };

    fetchData();
  }, [state.network_name]);

  return { validatorsRawData };
}

export function useGetValidators() {
  const [state] = useGlobalState();
  const { activeValidators } = useGetValidatorSet();
  const { validatorsRawData } = useGetValidatorsRawData();

  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [hasJsonStats, setHasJsonStats] = useState<boolean>(false);

  useEffect(() => {
    // Track if this effect instance is still current (for race condition prevention)
    let isCurrent = true;

    if (activeValidators.length > 0 && validatorsRawData.length > 0) {
      // If we have JSON stats data, merge it with active validators
      const validatorsCopy = JSON.parse(JSON.stringify(validatorsRawData));

      validatorsCopy.forEach((validator: ValidatorData) => {
        const activeValidator = activeValidators.find(
          (activeValidator) => activeValidator.addr === validator.owner_address,
        );
        validator.voting_power = activeValidator?.voting_power ?? "0";
      });

      setValidators(validatorsCopy);
      setHasJsonStats(true);
    } else if (activeValidators.length > 0) {
      // Fallback: use active validators directly when JSON stats are not available
      // Fetch operator addresses from StakePool resources
      const fetchOperatorAddresses = async () => {
        const validatorsWithOperators: ValidatorData[] = await Promise.all(
          activeValidators.map(async (v) => {
            let operatorAddress = v.addr; // Default to owner address
            try {
              const response = await state.aptos_client.getAccountResource(
                v.addr,
                "0x1::stake::StakePool"
              );
              if (response?.data) {
                const data = response.data as { operator_address: string };
                operatorAddress = data.operator_address;
              }
            } catch (e) {
              // If fetch fails, use owner address as fallback
              console.warn(`Failed to fetch StakePool for ${v.addr}:`, e);
            }
            return {
              owner_address: v.addr,
              operator_address: operatorAddress,
              voting_power: v.voting_power,
              governance_voting_record: "",
              last_epoch: 0,
              last_epoch_performance: "",
              liveness: 0,
              rewards_growth: 0,
              apt_rewards_distributed: 0,
            };
          })
        );
        // Only update state if this effect instance is still current
        if (isCurrent) {
          setValidators(validatorsWithOperators);
          setHasJsonStats(false);
        }
      };

      fetchOperatorAddresses();
    }

    // Cleanup: mark this effect instance as stale when it re-runs
    return () => {
      isCurrent = false;
    };
  }, [activeValidators, validatorsRawData, state.aptos_client]);

  return { validators, hasJsonStats };
}
