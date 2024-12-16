import * as React from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import TransactionBlockRow from "./Components/TransactionBlockRow";
import GradientBorderBox from "../../../components/IndividualPageContent/GradientBorderBox";

type StateCheckpointOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function StateCheckpointOverviewTab({
  transaction,
}: StateCheckpointOverviewTabProps) {
  const transactionData =
    transaction as Types.Transaction_StateCheckpointTransaction;

  return (
    <Box marginBottom={3}>
      <GradientBorderBox>
        <ContentBox>
          <ContentRow
            title={"Version:"}
            value={<Box sx={{fontWeight: 600}}>{transactionData.version}</Box>}
            tooltip={getLearnMoreTooltip("version")}
            titleColor="#fff"
          />
          <ContentRow
            title="Status:"
            value={<TransactionStatus success={transactionData.success} />}
            tooltip={getLearnMoreTooltip("status")}
            titleColor="#fff"
          />
          <TransactionBlockRow version={transactionData.version} color="" />
          {"timestamp" in transactionData && (
            <ContentRow
              title="Timestamp:"
              value={
                <TimestampValue
                  timestamp={transactionData.timestamp}
                  ensureMilliSeconds
                />
              }
              tooltip={getLearnMoreTooltip("timestamp")}
              titleColor="#fff"
            />
          )}
          <ContentRow
            title="VM Status:"
            value={transactionData.vm_status}
            tooltip={getLearnMoreTooltip("vm_status")}
            titleColor="#fff"
          />
        </ContentBox>
      </GradientBorderBox>
      <GradientBorderBox>
        <ContentBox>
          <ContentRow
            title="State Change Hash:"
            value={transactionData.state_change_hash}
            tooltip={getLearnMoreTooltip("state_change_hash")}
            titleColor="#fff"
          />
          <ContentRow
            title="Event Root Hash:"
            value={transactionData.event_root_hash}
            tooltip={getLearnMoreTooltip("event_root_hash")}
            titleColor="#fff"
          />
          <ContentRow
            title="Accumulator Root Hash:"
            value={transactionData.accumulator_root_hash}
            tooltip={getLearnMoreTooltip("accumulator_root_hash")}
            titleColor="#fff"
          />
        </ContentBox>
      </GradientBorderBox>
    </Box>
  );
}
