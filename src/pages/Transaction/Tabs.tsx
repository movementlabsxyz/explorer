import * as React from "react";
import {Box} from "@mui/material";
import {Types} from "aptos";
import {assertNever} from "../../utils";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import UserTransactionOverviewTab from "./Tabs/UserTransactionOverviewTab";
import BlockMetadataOverviewTab from "./Tabs/BlockMetadataOverviewTab";
import StateCheckpointOverviewTab from "./Tabs/StateCheckpointOverviewTab";
import PendingTransactionOverviewTab from "./Tabs/PendingTransactionOverviewTab";
import GenesisTransactionOverviewTab from "./Tabs/GenesisTransactionOverviewTab";
import EventsTab from "./Tabs/EventsTab";
import PayloadTab from "./Tabs/PayloadTab";
import ChangesTab from "./Tabs/ChangesTab";
import UnknownTab from "./Tabs/UnknownTab";

import BalanceChangeTab from "./Tabs/BalanceChangeTab";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../routing";

function getTabValues(transaction: Types.Transaction): TabValue[] {
  switch (transaction.type) {
    case "user_transaction":
      return [
        "userTxnOverview",
        "balanceChange",
        "events",
        "payload",
        "changes",
      ];
    case "block_metadata_transaction":
      return ["blockMetadataOverview", "events", "changes"];
    case "state_checkpoint_transaction":
      return ["stateCheckpointOverview"];
    case "pending_transaction":
      return ["pendingTxnOverview", "payload"];
    case "genesis_transaction":
      return ["genesisTxnOverview", "events", "payload", "changes"];
    default:
      return ["unknown"];
  }
}

const TabComponents = Object.freeze({
  userTxnOverview: UserTransactionOverviewTab,
  blockMetadataOverview: BlockMetadataOverviewTab,
  stateCheckpointOverview: StateCheckpointOverviewTab,
  pendingTxnOverview: PendingTransactionOverviewTab,
  genesisTxnOverview: GenesisTransactionOverviewTab,
  balanceChange: BalanceChangeTab,
  events: EventsTab,
  payload: PayloadTab,
  changes: ChangesTab,
  unknown: UnknownTab,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "userTxnOverview":
    case "blockMetadataOverview":
    case "stateCheckpointOverview":
    case "pendingTxnOverview":
    case "genesisTxnOverview":
      return "Overview";
    case "balanceChange":
      return "Balance Change";
    case "events":
      return "Events";
    case "payload":
      return "Payload";
    case "changes":
      return "Changes";
    case "unknown":
      return "Unknown";
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  transaction: Types.Transaction;
};

function TabPanel({value, transaction}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent transaction={transaction} />;
}

type TransactionTabsProps = {
  transaction: Types.Transaction;
  tabValues?: TabValue[];
};

export default function TransactionTabs({
  transaction,
  tabValues = getTabValues(transaction),
}: TransactionTabsProps): JSX.Element {
  const {tab, txnHashOrVersion} = useParams();
  const navigate = useNavigate();
  const value =
    tab === undefined ? getTabValues(transaction)[0] : (tab as TabValue);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    navigate(`/txn/${txnHashOrVersion}/${newValue}`, {replace: true});
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs
          value={value}
          onChange={handleChange}
          sx={{
            "& .MuiTabs-flexContainer": {
              gap: "8px",
            },
          }}
        >
          {tabValues.map((value, i) => (
            <StyledTab
              key={i}
              value={value}
              label={getTabLabel(value)}
              isFirst={i === 0}
              isLast={i === tabValues.length - 1}
              sx={{
                borderRadius: "8px 16px 4px 18px",
                padding: "10px 24px",
                minHeight: "unset",
                textTransform: "uppercase",
                fontWeight: 800,
                fontSize: "1rem",
                backgroundColor: "#FFD337",
                border: "none",
                color: "black",

                "&.Mui-selected": {
                  border: "none",
                  color: "#fff",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    borderRadius: "8px 16px 4px 18px",
                    padding: "1px",
                    background: "linear-gradient(90deg, #FFFFFF, #FFD337)",
                    maskImage:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    pointerEvents: "none",
                  },
                },
              }}
            />
          ))}
        </StyledTabs>
      </Box>
      <Box>
        <TabPanel value={value} transaction={transaction} />
      </Box>
    </Box>
  );
}
