import * as React from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import OverviewTab from "./Tabs/OverviewTab";
import TransactionsTab from "./Tabs/TransactionsTab";
import {assertNever} from "../../utils";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../routing";

const TAB_VALUES: TabValue[] = ["overview", "transactions"];

const TabComponents = Object.freeze({
  overview: OverviewTab,
  transactions: TransactionsTab,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "overview":
      return "Overview";
    case "transactions":
      return "Transactions";
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  data: Types.Block;
};

function TabPanel({value, data}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent data={data} />;
}

type AccountTabsProps = {
  data: Types.Block;
  tabValues?: TabValue[];
};

export default function BlockTabs({
  data,
  tabValues = TAB_VALUES,
}: AccountTabsProps): JSX.Element {
  const {height, tab} = useParams();
  const navigate = useNavigate();
  const value = tab === undefined ? TAB_VALUES[0] : (tab as TabValue);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    navigate(`/block/${height}/${newValue}`, {replace: true});
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
        <TabPanel value={value} data={data} />
      </Box>
    </Box>
  );
}
