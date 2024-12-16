import * as React from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../components/IndividualPageContent/ContentValue/GasValue";
import GasFeeValue from "../../../components/IndividualPageContent/ContentValue/GasFeeValue";
import {getTransactionAmount, getTransactionCounterparty} from "../utils";
import TransactionFunction from "./Components/TransactionFunction";
import TransactionBlockRow from "./Components/TransactionBlockRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {parseExpirationTimestamp} from "../../utils";
import {TransactionActions} from "./Components/TransactionActions";
import GradientBorderBox from "../../../components/IndividualPageContent/GradientBorderBox";

function UserTransferOrInteractionRows({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  const counterparty = getTransactionCounterparty(transaction);

  if (!counterparty) {
    return null;
  }

  return (
    <>
      {counterparty.role === "receiver" && (
        <ContentRow
          title="Receiver:"
          value={
            <HashButton hash={counterparty.address} type={HashType.ACCOUNT} />
          }
          tooltip={getLearnMoreTooltip("receiver")}
          titleColor="#fff"
        />
      )}
      {counterparty.role === "smartContract" && (
        <ContentRow
          title="Smart Contract:"
          value={
            <Box
              sx={{
                "& .MuiLink-root": {
                  color: "#FFD337 !important",
                  backgroundColor: "#000000",
                  "& span": {color: "#FFD337 !important"},
                  "& button": {color: "#FFD337 !important"},
                  borderRadius: "4px !important",
                },
              }}
            >
              <HashButton hash={counterparty.address} type={HashType.ACCOUNT} />
            </Box>
          }
          tooltip={getLearnMoreTooltip("smartContract")}
          titleColor="#fff"
        />
      )}
    </>
  );
}

function TransactionFunctionRow({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  return (
    <ContentRow
      title="Function:"
      value={
        <Box
          sx={{
            "& .MuiLink-root": {
              color: "#FFD337 !important",
              "& span": {color: "#FFD337 !important"},
              "& button": {color: "#FFD337 !important"},
            },
            "& .MuiBox-root": {
              backgroundColor: "black !important",
              borderRadius: "4px !important",
            },
          }}
        >
          <TransactionFunction transaction={transaction} />
        </Box>
      }
      tooltip={getLearnMoreTooltip("function")}
      titleColor="#fff"
    />
  );
}

function TransactionAmountRow({transaction}: {transaction: Types.Transaction}) {
  const amount = getTransactionAmount(transaction);

  return (
    <ContentRow
      title="Amount:"
      value={
        amount !== undefined ? (
          <APTCurrencyValue amount={amount.toString()} color="#FFD700" />
        ) : null
      }
      tooltip={getLearnMoreTooltip("amount")}
      titleColor="#fff"
    />
  );
}

type UserTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function UserTransactionOverviewTab({
  transaction,
}: UserTransactionOverviewTabProps) {
  const transactionData = transaction as Types.Transaction_UserTransaction;

  return (
    <Box marginBottom={2}>
      <GradientBorderBox>
        <ContentBox padding={4}>
          <ContentRow
            title={"Version:"}
            value={<Box sx={{fontWeight: 600}}>{transactionData.version}</Box>}
            tooltip={getLearnMoreTooltip("version")}
            titleColor="#fff"
          />
          <ContentRow
            title="Status:"
            value={
              <Box
                sx={{
                  "& .MuiStack-root": {
                    borderRadius: "4px !important",
                  },
                }}
              >
                <TransactionStatus success={transactionData.success} />
              </Box>
            }
            tooltip={getLearnMoreTooltip("status")}
            titleColor="#fff"
          />
          <ContentRow
            title="Sender:"
            value={
              <Box
                sx={{
                  "& .MuiLink-root": {
                    color: "#FFD337 !important",
                    "& span": {color: "#FFD337 !important"},
                    "& button": {color: "#FFD337 !important"},
                    borderRadius: "4px !important",
                    backgroundColor: "#000000",
                  },
                }}
              >
                <HashButton
                  hash={transactionData.sender}
                  type={HashType.ACCOUNT}
                />
              </Box>
            }
            tooltip={getLearnMoreTooltip("sender")}
            titleColor="#fff"
          />
          <UserTransferOrInteractionRows transaction={transactionData} />
          <TransactionFunctionRow transaction={transactionData} />
          <TransactionAmountRow transaction={transactionData} />
        </ContentBox>
      </GradientBorderBox>
      <GradientBorderBox>
        <ContentBox>
          <TransactionBlockRow color="#fff" version={transactionData.version} />
          <ContentRow
            title="Sequence Number:"
            value={transactionData.sequence_number}
            tooltip={getLearnMoreTooltip("sequence_number")}
            titleColor="#fff"
          />
          <ContentRow
            title="Expiration Timestamp:"
            titleColor="#fff"
            value={
              <TimestampValue
                timestamp={parseExpirationTimestamp(
                  transactionData.expiration_timestamp_secs,
                )}
                ensureMilliSeconds={false}
              />
            }
            tooltip={getLearnMoreTooltip("expiration_timestamp_secs")}
          />
          <ContentRow
            title="Timestamp:"
            titleColor="#fff"
            value={
              <TimestampValue
                timestamp={transactionData.timestamp}
                ensureMilliSeconds
              />
            }
            tooltip={getLearnMoreTooltip("timestamp")}
          />
          <ContentRow
            title="Gas Fee:"
            titleColor="#fff"
            value={
              <GasFeeValue
                gasUsed={transactionData.gas_used}
                gasUnitPrice={transactionData.gas_unit_price}
                showGasUsed
              />
            }
            tooltip={getLearnMoreTooltip("gas_fee")}
          />
          <ContentRow
            title="Gas Unit Price:"
            titleColor="#fff"
            value={<APTCurrencyValue amount={transactionData.gas_unit_price} />}
            tooltip={getLearnMoreTooltip("gas_unit_price")}
          />
          <ContentRow
            title="Max Gas Limit:"
            titleColor="#fff"
            value={<GasValue gas={transactionData.max_gas_amount} />}
            tooltip={getLearnMoreTooltip("max_gas_amount")}
          />
          <ContentRow
            title="VM Status:"
            titleColor="#fff"
            value={transactionData.vm_status}
            tooltip={getLearnMoreTooltip("vm_status")}
          />
        </ContentBox>
      </GradientBorderBox>
      <GradientBorderBox>
        <ContentBox>
          <ContentRow
            title="Signature:"
            value={
              <JsonViewCard
                data={transactionData.signature}
                collapsedByDefault
              />
            }
            tooltip={getLearnMoreTooltip("signature")}
            titleColor="#fff"
          />
          <ContentRow
            title="State Change Hash:"
            value={transactionData.state_change_hash}
            titleColor="#fff"
            tooltip={getLearnMoreTooltip("state_change_hash")}
          />
          <ContentRow
            title="Event Root Hash:"
            value={transactionData.event_root_hash}
            titleColor="#fff"
            tooltip={getLearnMoreTooltip("event_root_hash")}
          />
          <ContentRow
            title="Accumulator Root Hash:"
            titleColor="#fff"
            value={transactionData.accumulator_root_hash}
            tooltip={getLearnMoreTooltip("accumulator_root_hash")}
          />
        </ContentBox>
      </GradientBorderBox>
      <TransactionActions transaction={transaction} />
    </Box>
  );
}
