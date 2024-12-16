import {Box} from "@mui/material";
import {Types} from "aptos";
import React from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {Link} from "../../../routing";
import {getLearnMoreTooltip} from "../../Transaction/helpers";

function isBlockMetadataTransaction(
  txn: Types.Transaction,
): txn is Types.Transaction_BlockMetadataTransaction {
  return (
    (txn as Types.Transaction_BlockMetadataTransaction).type ===
    "block_metadata_transaction"
  );
}

function VersionValue({data}: {data: Types.Block}) {
  const {first_version, last_version} = data;
  return (
    <>
      <Link to={`/txn/${first_version}`} underline="none">
        {first_version}
      </Link>
      {" - "}
      <Link to={`/txn/${last_version}`} underline="none">
        {last_version}
      </Link>
    </>
  );
}

function BlockMetadataRows({
  blockTxn,
}: {
  blockTxn: Types.Transaction | undefined;
}) {
  if (!blockTxn) {
    return null;
  }

  const txn = blockTxn as Types.Transaction_BlockMetadataTransaction;

  return (
    <>
      <ContentRow
        title="Proposer:"
        value={
          <Box
            sx={{
              "& .MuiLink-root": {
                color: "#FFD337 !important",
                "& span": {color: "#FFD337 !important"},
                "& button": {color: "#FFD337 !important"},
              },
            }}
          >
            <HashButton hash={txn.proposer} type={HashType.ACCOUNT} />
          </Box>
        }
        tooltip={getLearnMoreTooltip("proposer")}
        titleColor="#fff"
      />
      <ContentRow
        title="Epoch:"
        value={txn.epoch}
        tooltip={getLearnMoreTooltip("epoch")}
        titleColor="#fff"
      />
      <ContentRow
        title="Round:"
        value={txn.round}
        tooltip={getLearnMoreTooltip("round")}
        titleColor="#fff"
      />
    </>
  );
}

type OverviewTabProps = {
  data: Types.Block;
};

export default function OverviewTab({data}: OverviewTabProps) {
  const blockTxn: Types.Transaction | undefined = (
    data.transactions ?? []
  ).find(isBlockMetadataTransaction);

  return (
    <Box marginBottom={3}>
      <Box
        sx={{
          position: "relative",
          "& > .MuiBox-root": {
            borderRadius: "16px",
            overflow: "hidden",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderRadius: "16px",
            padding: "1px",
            background: "linear-gradient(90deg, #FFFFFF, #FFD337)",
            maskImage:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            pointerEvents: "none",
            zIndex: 1,
          },
        }}
      >
        <ContentBox>
          <ContentRow
            title={"Block Height:"}
            value={data.block_height}
            tooltip={getLearnMoreTooltip("block_height")}
            titleColor="#fff"
          />
          <ContentRow
            title={"Version:"}
            value={<VersionValue data={data} />}
            tooltip={getLearnMoreTooltip("version")}
            titleColor="#fff"
          />
          <ContentRow
            title={"Timestamp:"}
            value={
              <TimestampValue
                timestamp={data.block_timestamp}
                ensureMilliSeconds
              />
            }
            tooltip={getLearnMoreTooltip("timestamp")}
            titleColor="#fff"
          />
          <BlockMetadataRows blockTxn={blockTxn} />
        </ContentBox>
      </Box>
    </Box>
  );
}
