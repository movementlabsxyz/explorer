import * as React from "react";
import {Stack, TableFooter} from "@mui/material";
import Table from "@mui/material/Table";
import {Types} from "aptos";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import HashButton, {HashType} from "../../../components/HashButton";
// import {Link} from "../../../routing";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import {TablePagination} from "../../../components/Table/TablePagination";

// type BlockTransaction = {
//   block: string;
//   age: string;
//   hash: string;
//   firstVersion: string;
//   lastVersion: string;
// };

type BlockTransactionCellProps = {
  transaction: Types.Transaction;
};

// Individual cell components
function BlockNumberCell({}: BlockTransactionCellProps) {
  // function BlockNumberCell({transaction}: BlockTransactionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {/* <Link to={`/block/${transaction.block}`} color="primary" underline="none">
        {transaction.block}
      </Link> */}
    </GeneralTableCell>
  );
}

function AgeCell({}: BlockTransactionCellProps) {
  return (
    <GeneralTableCell>
      {/* <Typography variant="body2">{transaction.age}</Typography> */}
    </GeneralTableCell>
  );
}

function HashCell({transaction}: BlockTransactionCellProps) {
  return (
    <GeneralTableCell>
      <HashButton hash={transaction.hash} type={HashType.ACCOUNT} />
    </GeneralTableCell>
  );
}

function VersionRangeCell({}: BlockTransactionCellProps) {
  return (
    <GeneralTableCell>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* <Link
          to={`/version/${transaction.firstVersion}`}
          color="primary"
          underline="none"
        >
          {transaction.firstVersion}
        </Link>
        <Typography variant="body2">to</Typography>
        <Link
          to={`/version/${transaction.lastVersion}`}
          color="primary"
          underline="none"
        >
          {transaction.lastVersion}
        </Link> */}
      </Stack>
    </GeneralTableCell>
  );
}

const BlockTransactionCells = Object.freeze({
  blockNum: BlockNumberCell,
  age: AgeCell,
  hash: HashCell,
  firstVersion: VersionRangeCell,
  lastVersion: VersionRangeCell,
});

type BlockTransactionColumn = keyof typeof BlockTransactionCells;

const DEFAULT_COLUMNS: BlockTransactionColumn[] = [
  "blockNum",
  "age",
  "hash",
  "firstVersion",
  "lastVersion",
];

type BlockTransactionHeaderCellProps = {
  column: BlockTransactionColumn;
};

function BlockTransactionHeaderCell({column}: BlockTransactionHeaderCellProps) {
  switch (column) {
    case "blockNum":
      return <GeneralTableHeaderCell header="Block" />;
    case "age":
      return <GeneralTableHeaderCell header="Age" />;
    case "hash":
      return <GeneralTableHeaderCell header="Hash" />;
    case "firstVersion":
      return <GeneralTableHeaderCell header="First Version" />;
    case "lastVersion":
      return <GeneralTableHeaderCell header="Last Version" />;
    default:
      return null;
  }
}

type BlockTransactionRowProps = {
  transaction: Types.Transaction;
  columns: BlockTransactionColumn[];
};

function BlockTransactionRow({transaction, columns}: BlockTransactionRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = BlockTransactionCells[column];
        return <Cell key={column} transaction={transaction} />;
      })}
    </GeneralTableRow>
  );
}

type BlockTransactionsTableProps = {
  transactions: Types.Transaction[];
  columns?: BlockTransactionColumn[];
};

export default function BlockTransactionsTable({
  transactions,
  columns = DEFAULT_COLUMNS,
}: BlockTransactionsTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <BlockTransactionHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {transactions.map((transaction, i) => {
          return (
            <BlockTransactionRow
              key={`${i}-${transaction.hash}`}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </GeneralTableBody>
      <TableFooter>
        <TablePagination
        // currentPage={currentPage}
        // totalPages={totalPages}
        // onPageChange={setCurrentPage}
        />
      </TableFooter>
    </Table>
  );
}
