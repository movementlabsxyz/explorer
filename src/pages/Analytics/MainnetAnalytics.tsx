import React, {useState} from "react";
import {Grid2} from "@mui/material";
import {useGetAnalyticsData} from "../../api/hooks/useGetAnalyticsData";
import ChartRangeDaysSelect, {
  ChartRangeDays,
} from "./Components/ChartRangeDaysSelect";
import DailyActiveUserChart from "./Charts/DailyActiveUserChart";
import DailyAvgGasUnitPriceChart from "./Charts/DailyAvgGasUnitPriceChart";
import DailyPeakTPSChart from "./Charts/DailyPeakTPSChart";
import DailyUserTransactionsChart from "./Charts/DailyUserTransactionsChart";
import NetworkInfo from "./NetworkInfo/NetworkInfo";
import DailyGasConsumptionChart from "./Charts/DailyGasConsumptionChart";
import MonthlyActiveUserChart from "./Charts/MonthlyActiveUserChart";

export default function MainnetAnalytics() {
  const [days, setDays] = useState<ChartRangeDays>(
    ChartRangeDays.DEFAULT_RANGE,
  );

  const data = useGetAnalyticsData();

  if (!data) {
    // TODO: apply better error message
    return null;
  }

  return (
    <Grid2 container spacing={3} marginTop={3}>
      <Grid2 size={{xs: 12, md: 12, lg: 12}} marginBottom={2}>
        <NetworkInfo />
      </Grid2>
      <Grid2 size={{xs: 12, md: 12, lg: 12}}>
        <ChartRangeDaysSelect days={days} setDays={setDays} />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyUserTransactionsChart
          data={data.daily_user_transactions}
          days={days}
        />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyPeakTPSChart data={data.daily_max_tps_15_blocks} days={days} />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <MonthlyActiveUserChart data={data.mau_signers} days={days} />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyActiveUserChart data={data.daily_active_users} days={days} />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyNewAccountsCreatedChart
          data={data.daily_new_accounts_created}
          days={days}
        />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyDeployedContractsChart
          data={data.daily_deployed_contracts}
          days={days}
        />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyContractDeployersChart
          data={data.daily_contract_deployers}
          days={days}
        />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyGasConsumptionChart
          data={data.daily_gas_from_user_transactions}
          days={days}
        />
      </Grid2>
      <Grid2 size={{xs: 12, md: 6, lg: 3}}>
        <DailyAvgGasUnitPriceChart
          data={data.daily_average_gas_unit_price}
          days={days}
        />
      </Grid2>
    </Grid2>
  );
}
