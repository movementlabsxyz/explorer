import {Box, Typography} from "@mui/material";
import * as React from "react";
// import {defaultNetworkName} from "../../constants";
// import {useGlobalState} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import MainnetAnalytics from "./MainnetAnalytics";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

export default function AnalyticsPage() {
  // const [state] = useGlobalState();

  usePageMetadata({title: "Network Analytics"});
  const titleComponent = (
    <Typography variant="h3" marginBottom={2}>
      Network Analytics
    </Typography>
  );

  return (
    <Box>
      <PageHeader />
      <>
        {titleComponent}
        <MainnetAnalytics />
      </>
      {/* {state.network_name === defaultNetworkName ? (
        <>
          {titleComponent}
          <MainnetAnalytics />
        </>
      ) 
      : (
        <>
          {titleComponent}
          <Typography>
            Analytics are available for Testnet & Mainnet.
          </Typography>
        </>
      )
      } */}
    </Box>
  );
}
