import React from "react";
import {Types} from "aptos";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import BlockTransactionsTable from "../Tables/BlockTransactionsTable";

type TransactionsTabProps = {
  data: Types.Block;
};

export default function TransactionsTab({data}: TransactionsTabProps) {
  const transactions = data.transactions ?? [];
  if (transactions.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <>
      <BlockTransactionsTable transactions={transactions} />
    </>
  );
}
