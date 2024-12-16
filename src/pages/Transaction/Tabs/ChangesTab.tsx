import * as React from "react";
import {Types} from "aptos";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {
  collectionV2Address,
  objectCoreAddress,
  tokenV2Address,
} from "../../../constants";
import GradientBorderBox from "../../../components/IndividualPageContent/GradientBorderBox";
import {Box} from "@mui/material";

type ChangesTabProps = {
  transaction: Types.Transaction;
};

export default function ChangesTab({transaction}: ChangesTabProps) {
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(changes.length);

  if (changes.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {changes.map((change, i) => (
        <GradientBorderBox>
          <CollapsibleCard
            key={i}
            titleKey="Index:"
            titleValue={i.toString()}
            expanded={expandedList[i]}
            toggleExpanded={() => toggleExpandedAt(i)}
            useCustomBackground={true}
          >
            <ContentRow titleColor="#fff" title="Type:" value={change.type} />
            {"address" in change && (
              <ContentRow
                title="Address:"
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
                      hash={change.address}
                      type={
                        "data" in change &&
                        "type" in change.data &&
                        [
                          objectCoreAddress,
                          tokenV2Address,
                          collectionV2Address,
                        ].includes(change.data.type)
                          ? HashType.OBJECT
                          : HashType.ACCOUNT
                      }
                    />
                  </Box>
                }
              />
            )}
            <ContentRow
              titleColor="#fff"
              title="State Key Hash:"
              value={change.state_key_hash}
            />
            {"data" in change && change.data && (
              <ContentRow
                title="Data:"
                titleColor="#fff"
                value={<JsonViewCard data={change.data} />}
              />
            )}
            {"handle" in change && (
              <ContentRow
                titleColor="#fff"
                title="Handle:"
                value={change.handle}
              />
            )}
            {"key" in change && (
              <ContentRow titleColor="#fff" title="Key:" value={change.key} />
            )}
            {"value" in change && (
              <ContentRow
                titleColor="#fff"
                title="Value:"
                value={change.value}
              />
            )}
          </CollapsibleCard>
        </GradientBorderBox>
      ))}
    </CollapsibleCards>
  );
}
