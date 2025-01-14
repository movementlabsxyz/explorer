import * as React from "react";
import {Box, Stack} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../components/HashButton";
import {Types} from "aptos";
import {assertNever} from "../../utils";
import {TableTransactionType} from "../../components/TransactionType";
import {TableTransactionStatus} from "../../components/TransactionStatus";
import {getTableFormattedTimestamp} from "../utils";
import GasFeeValue from "../../components/IndividualPageContent/ContentValue/GasFeeValue";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import TransactionTypeTooltip from "./Components/TransactionTypeTooltip";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import {
  grey,
  negativeColor,
  aptosColor,
} from "../../themes/colors/aptosColorPalette";
import TransactionFunction from "../Transaction/Tabs/Components/TransactionFunction";
import {
  getCoinBalanceChangeForAccount,
  getTransactionAmount,
  getTransactionCounterparty,
} from "../Transaction/utils";
import {Link} from "../../routing";
import {TableGradientBorderBox} from "../../components/IndividualPageContent/GradientBorderBox";

type TransactionCellProps = {
  transaction: Types.Transaction;
  address?: string;
};

export function SequenceNumberCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {"sequence_number" in transaction && transaction.sequence_number}
    </GeneralTableCell>
  );
}

export function TransactionVersionStatusCell({
  transaction,
}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Stack direction="row" spacing={0.5}>
        <Link
          to={`/txn/${"version" in transaction && transaction.version}`}
          color="primary"
          underline="none"
        >
          {"version" in transaction && transaction.version}
        </Link>
        {"success" in transaction && (
          <TableTransactionStatus success={transaction.success} />
        )}
      </Stack>
    </GeneralTableCell>
  );
}

export function TransactionTypeCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell>
      {<TableTransactionType type={transaction.type} />}
    </GeneralTableCell>
  );
}

export function TransactionTimestampCell({transaction}: TransactionCellProps) {
  const timestamp =
    "timestamp" in transaction ? (
      getTableFormattedTimestamp(transaction.timestamp)
    ) : (
      // Genesis transaction
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  return <GeneralTableCell>{timestamp}</GeneralTableCell>;
}

export function TransactionSenderCell({transaction}: TransactionCellProps) {
  let sender;
  if (transaction.type === "user_transaction") {
    sender = (transaction as Types.UserTransaction).sender;
  } else if (transaction.type === "block_metadata_transaction") {
    sender = (transaction as Types.BlockMetadataTransaction).proposer;
  }

  return (
    <GeneralTableCell
      sx={{
        "& a": {color: "#FFDA34"},
      }}
    >
      {sender && <HashButton hash={sender} type={HashType.ACCOUNT} />}
    </GeneralTableCell>
  );
}

export function TransactionReceiverOrCounterPartyCell({
  transaction,
}: TransactionCellProps) {
  const counterparty = getTransactionCounterparty(transaction);
  return (
    <GeneralTableCell
      sx={{
        "& a": {color: "#FFDA34"},
      }}
    >
      {counterparty && (
        <HashButton hash={counterparty.address} type={HashType.ACCOUNT} />
      )}
    </GeneralTableCell>
  );
}

export function TransactionFunctionCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell
      sx={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      <TransactionFunction
        transaction={transaction}
        sx={{maxWidth: {xs: 200, md: 300, lg: 400, color: "#FFDA34"}}}
      />
    </GeneralTableCell>
  );
}

function TransactionAmount({
  transaction,
  address,
}: {
  transaction: Types.Transaction;
  address?: string;
}) {
  const isAccountTransactionTable = typeof address === "string";

  if (isAccountTransactionTable) {
    const amount = getCoinBalanceChangeForAccount(transaction, address);
    if (amount !== undefined) {
      let amountAbs = amount;
      let color = undefined;
      if (amount > 0) {
        color = aptosColor;
      } else if (amount < 0) {
        color = negativeColor;
        amountAbs = -amount;
      }

      return (
        <Box sx={{color: color}}>
          {amount > 0 && <>+</>}
          {amount < 0 && <>-</>}
          <APTCurrencyValue amount={amountAbs.toString()} />
        </Box>
      );
    }
  } else {
    const amount = getTransactionAmount(transaction);
    if (amount !== undefined) {
      return (
        <Box>
          <APTCurrencyValue amount={amount.toString()} />
        </Box>
      );
    }
  }

  return null;
}

export function TransactionAmountGasCell({
  transaction,
  address,
}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{paddingY: 1}}>
      <Stack sx={{textAlign: "right"}}>
        <TransactionAmount transaction={transaction} address={address} />
        <Box sx={{fontSize: 11, color: grey[450]}}>
          {"gas_used" in transaction && "gas_unit_price" in transaction ? (
            <>
              <>Gas </>
              <GasFeeValue
                gasUsed={transaction.gas_used}
                gasUnitPrice={transaction.gas_unit_price}
              />
            </>
          ) : null}
        </Box>
      </Stack>
    </GeneralTableCell>
  );
}

const TransactionCells = Object.freeze({
  sequenceNum: SequenceNumberCell,
  versionStatus: TransactionVersionStatusCell,
  type: TransactionTypeCell,
  timestamp: TransactionTimestampCell,
  sender: TransactionSenderCell,
  receiverOrCounterParty: TransactionReceiverOrCounterPartyCell,
  function: TransactionFunctionCell,
  amountGas: TransactionAmountGasCell,
});

type TransactionColumn = keyof typeof TransactionCells;

const DEFAULT_COLUMNS: TransactionColumn[] = [
  "versionStatus",
  "type",
  "timestamp",
  "sender",
  "receiverOrCounterParty",
  "function",
  "amountGas",
];

type TransactionRowProps = {
  transaction: Types.Transaction;
  columns: TransactionColumn[];
};

function TransactionRow({transaction, columns}: TransactionRowProps) {
  return (
    <GeneralTableRow
      to={`/txn/${"version" in transaction && transaction.version}`}
    >
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        return <Cell key={column} transaction={transaction} />;
      })}
    </GeneralTableRow>
  );
}

type UserTransactionRowProps = {
  version: number;
  columns: TransactionColumn[];
  address?: string;
};

function UserTransactionRow({
  version,
  columns,
  address,
}: UserTransactionRowProps) {
  const {data: transaction, isError} = useGetTransaction(version.toString());

  if (!transaction || isError) {
    return null;
  }

  return (
    <GeneralTableRow to={`/txn/${version}`}>
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        return (
          <Cell key={column} transaction={transaction} address={address} />
        );
      })}
    </GeneralTableRow>
  );
}

type TransactionHeaderCellProps = {
  column: TransactionColumn;
};

function TransactionHeaderCell({column}: TransactionHeaderCellProps) {
  switch (column) {
    case "sequenceNum":
      return <GeneralTableHeaderCell header="#" />;
    case "versionStatus":
      return <GeneralTableHeaderCell header="Version" />;
    case "type":
      return (
        <GeneralTableHeaderCell
          header="Type"
          tooltip={<TransactionTypeTooltip />}
          sx={{textAlign: "center"}}
        />
      );
    case "timestamp":
      return <GeneralTableHeaderCell header="Timestamp" />;
    case "sender":
      return <GeneralTableHeaderCell header="Sender" />;
    case "receiverOrCounterParty":
      return <GeneralTableHeaderCell header="Sent To" />;
    case "function":
      return <GeneralTableHeaderCell header="Function" />;
    case "amountGas":
      return <GeneralTableHeaderCell header="Amount" textAlignRight />;
    default:
      return assertNever(column);
  }
}

type TransactionsTableProps = {
  transactions: Types.Transaction[];
  columns?: TransactionColumn[];
  address?: string;
};

export default function TransactionsTable({
  transactions,
  columns = DEFAULT_COLUMNS,
}: TransactionsTableProps) {
  return (
    <TableGradientBorderBox>
      <Box
        sx={{
          margin: "0 auto",
          overflowX: "auto",
          padding: "1px",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 218, 52, 0.3)",
            borderRadius: "3px",
          },
        }}
      >
        <Table
          sx={{
            tableLayout: "fixed",
            "& td, & th": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              padding: "12px 16px",
            },
            // Desktop styles
            "@media (min-width: 769px)": {
              "& th:nth-of-type(2)": {
                width: "60px",
                minWidth: "60px",
                maxWidth: "60px",
              },
              "& th:nth-of-type(6)": {
                width: "30%",
              },
            },
            "@media (max-width: 768px)": {
              tableLayout: "auto",
              "& td, & th": {
                fontSize: "0.875rem",
              },
            },
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TransactionHeaderCell key={column} column={column} />
              ))}
            </TableRow>
          </TableHead>
          <GeneralTableBody>
            {transactions.map((transaction, i) => {
              return (
                <TransactionRow
                  key={`${i}-${transaction.hash}`}
                  transaction={transaction}
                  columns={columns}
                />
              );
            })}
          </GeneralTableBody>
        </Table>
      </Box>
    </TableGradientBorderBox>
  );
}

type UserTransactionsTableProps = {
  versions: number[];
  columns?: TransactionColumn[];
  address?: string;
};

export function UserTransactionsTable({
  versions,
  columns = DEFAULT_COLUMNS,
  address,
}: UserTransactionsTableProps) {
  return (
    <Table sx={{minWidth: 650}}>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TransactionHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {versions.map((version, i) => {
          return (
            <UserTransactionRow
              key={`${i}-${version}`}
              version={version}
              columns={columns}
              address={address}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
