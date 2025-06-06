import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {
  CoinHolder,
  useGetCoinHolders,
} from "../../../api/hooks/useGetCoinHolders";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {FACombinedData} from "../Index";
import LoadingModal from "../../../components/LoadingModal";

type HoldersTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

export default function HoldersTab({address, data}: HoldersTabProps) {
  const holderData = useGetCoinHolders(address);
  if (holderData?.isLoading) {
    return <LoadingModal open={true} />;
  }
  if (!data || Array.isArray(data) || !holderData?.data) {
    return <EmptyTabContent />;
  }

  return <HoldersTable data={data} holders={holderData.data} />;
}

export function HoldersTable({
  data,
  holders,
}: {
  holders: CoinHolder[];
  data: FACombinedData;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="rank" />
          <GeneralTableHeaderCell header="holder address" />
          <GeneralTableHeaderCell header="amount" textAlignRight={true} />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {holders.map((holder, i) => {
          return (
            <GeneralTableRow>
              <GeneralTableCell>{i}</GeneralTableCell>
              <GeneralTableCell>
                <HashButton
                  hash={holder.owner_address}
                  type={HashType.ACCOUNT}
                />
              </GeneralTableCell>
              <GeneralTableCell align={"right"}>
                {getFormattedBalanceStr(
                  holder.amount.toString(),
                  data.coinData?.decimals ?? data.metadata?.decimals,
                ) +
                  " " +
                  (data.coinData?.symbol ?? data.metadata?.symbol)}
              </GeneralTableCell>
            </GeneralTableRow>
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
