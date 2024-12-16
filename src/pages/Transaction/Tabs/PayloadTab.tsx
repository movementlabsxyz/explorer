import React, {useState} from "react";
import {Types} from "aptos";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import GradientBorderBox from "../../../components/IndividualPageContent/GradientBorderBox";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

export default function PayloadTab({transaction}: PayloadTabProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  if (!("payload" in transaction)) {
    return <EmptyTabContent />;
  }

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <GradientBorderBox>
      <CollapsibleCard
        key={0}
        titleKey="Type:"
        titleValue={transaction.payload.type}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        useCustomBackground={true}
      >
        <JsonViewCard data={transaction.payload} />
      </CollapsibleCard>
    </GradientBorderBox>
  );
}
