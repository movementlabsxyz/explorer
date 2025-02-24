import React, {createContext} from "react";
import {Grid2, Grid} from "@mui/material";
// import TotalSupply from "./TotalSupply";
// import TotalStake from "./TotalStake";
// import TPS from "./TPS";
import TotalTransactions from "./TotalTransactions";
import {Link} from "../../../routing";
import TotalNewAccountsCreated from "../Charts/TotalNewAccountsCreated";
import TotalDeployedContracts from "../Charts/TotalDeployedContracts";
import TotalContractDeployers from "../Charts/TotalContractDeployers";
import {useGetAnalyticsData} from "../../../api/hooks/useGetAnalyticsData";
type CardStyle = "default" | "outline";

export const StyleContext = createContext<CardStyle>("default");

function LinkableContainer({
  linkToAnalyticsPage,
  children,
}: {
  linkToAnalyticsPage: boolean;
  children: React.ReactNode;
}) {

  return linkToAnalyticsPage ? (
    <Link to="/analytics" underline="none" color="inherit" variant="inherit">
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}

type NetworkInfoProps = {
  isOnHomePage?: boolean;
};

export default function NetworkInfo({isOnHomePage}: NetworkInfoProps) {
  const onHomePage = isOnHomePage === true;

  const data = useGetAnalyticsData();
  if (!data) {
    // TODO: apply better error message
    return null;
  }

  return (
    <StyleContext.Provider value={onHomePage ? "default" : "outline"}>
      <Grid2
        container
        spacing={2}
        direction="row"
        sx={{alignContent: "flex-start", justifyContent: "evenly"}}
        marginBottom={onHomePage ? 3 : 0}
      >
        <Grid item xs={12} md={3} lg={2.4}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TotalTransactions type={"card"} />
          </LinkableContainer>
        </Grid>
        {/* <Grid item xs={12} md={3} lg={2.4}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TPS />
          </LinkableContainer>
        </Grid> */}
        <Grid item xs={12} md={3} lg={2.4}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TotalNewAccountsCreated
              data={data.total_accounts[0].total_accounts}
            />
          </LinkableContainer>
        </Grid>
        <Grid item xs={12} md={3} lg={2.4}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TotalDeployedContracts
              data={data.cumulative_deployers[0].cumulative_contracts_deployed}
            />
          </LinkableContainer>
        </Grid>
        <Grid item xs={12} md={3} lg={2.4}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TotalContractDeployers
              data={data.cumulative_deployers[0].cumulative_contract_deployers}
            />
          </LinkableContainer>
        </Grid>
      </Grid2>
    </StyleContext.Provider>
  );
}
