import React from "react";
import {Types} from "aptos";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import GradientBorderBox from "../../../components/IndividualPageContent/GradientBorderBox";
import {Box} from "@mui/material";

type EventsTabProps = {
  transaction: Types.Transaction;
};

export default function EventsTab({transaction}: EventsTabProps) {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(events.length);

  if (events.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {events.map((event, i) => (
        <GradientBorderBox>
          <CollapsibleCard
            key={i}
            titleKey="Index:"
            titleValue={i.toString()}
            expanded={expandedList[i]}
            toggleExpanded={() => toggleExpandedAt(i)}
            useCustomBackground={true}
          >
            <ContentRow
              title="Account Address:"
              titleColor="#fff"
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
                  <HashButton
                    hash={event.guid.account_address}
                    type={HashType.ACCOUNT}
                  />
                </Box>
              }
            />
            <ContentRow
              title="Creation Number:"
              titleColor="#fff"
              value={event.guid.creation_number}
            />
            <ContentRow
              title="Sequence Number:"
              titleColor="#fff"
              value={event.sequence_number}
            />
            <ContentRow title="Type:" titleColor="#fff" value={event.type} />
            <ContentRow
              title="Data:"
              titleColor="#fff"
              value={<JsonViewCard data={event.data} />}
            />
          </CollapsibleCard>
        </GradientBorderBox>
      ))}
    </CollapsibleCards>
  );
}
