import React from "react";
import {Grid2, Stack} from "@mui/material";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorsGeoData";
import EpochSection from "./Epoch";
import StakingSection from "./Staking";
import NodeCountsSection from "./NodeCounts";

type MapMetricsProps = {
  validatorGeoMetric: ValidatorGeoMetric;
  isOnMobile?: boolean;
  isSkeletonLoading: boolean;
  hasGeoData?: boolean;
};

export default function MapMetrics({
  validatorGeoMetric,
  isOnMobile,
  isSkeletonLoading,
  hasGeoData = false,
}: MapMetricsProps) {
  // When on mobile or no geo data, use horizontal grid layout
  if (isOnMobile || !hasGeoData) {
    return (
      <Grid2
        container
        direction="row"
        marginX={2}
        marginTop={hasGeoData ? 0.5 : 2}
        marginBottom={hasGeoData ? 4 : 6}
        spacing={4}
        justifyContent="flex-start"
      >
        <Grid2 size={{xs: 12, sm: 4, md: 3}}>
          <NodeCountsSection
            validatorGeoMetric={validatorGeoMetric}
            isSkeletonLoading={isSkeletonLoading}
            hasGeoData={hasGeoData}
          />
        </Grid2>
        <Grid2 size={{xs: 12, sm: 4, md: 4}}>
          <EpochSection isSkeletonLoading={isSkeletonLoading} />
        </Grid2>
        <Grid2 size={{xs: 12, sm: 4, md: 4}}>
          <StakingSection isSkeletonLoading={isSkeletonLoading} />
        </Grid2>
      </Grid2>
    );
  }

  // When there's geo data and not on mobile, use vertical stack (next to map)
  return (
    <Stack
      marginY={4}
      marginLeft={4}
      spacing={4}
      justifyContent="center"
      minWidth={232}
    >
      <NodeCountsSection
        validatorGeoMetric={validatorGeoMetric}
        isSkeletonLoading={isSkeletonLoading}
        hasGeoData={hasGeoData}
      />
      <EpochSection isSkeletonLoading={isSkeletonLoading} />
      <StakingSection isSkeletonLoading={isSkeletonLoading} />
    </Stack>
  );
}
