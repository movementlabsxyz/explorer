import React from "react";
import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {Types} from "aptos";
import {getLedgerInfo, getTransactions} from "../../api";
import {useGlobalState} from "../../global-config/GlobalConfig";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {Button, Stack} from "@mui/material";
import TransactionsTable from "./TransactionsTable";

const LIMIT = 20;
const NUM_PAGES = 100;

function maxStart(maxVersion: number, limit: number) {
  return Math.max(0, 1 + maxVersion - limit);
}

function RenderPagination({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPageNum: number) => {
    if (newPageNum >= 1 && newPageNum <= numPages) {
      searchParams.set("page", newPageNum.toString());
      setSearchParams(searchParams);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(numPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          sx={{
            minWidth: "auto",
            px: 1.5,
            mx: 0.5,
            color: "#FFD700",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: currentPage === i ? "2px solid #FFD700" : "none",
            borderRadius: 0,
            fontWeight: currentPage === i ? "bold" : "normal",
            "&:hover": {
              backgroundColor: "transparent",
              opacity: 0.8,
            },
          }}
        >
          {i}
        </Button>,
      );
    }

    if (endPage < numPages) {
      pageNumbers.push(
        <Box key="ellipsis" component="span" sx={{color: "#FFD700", px: 1}}>
          ...
        </Box>,
      );
    }

    return pageNumbers;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 3,
      }}
    >
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        sx={{
          px: 2,
          py: 0.5,
          backgroundColor: "#FFD700",
          color: "black",
          fontWeight: "bold",
          opacity: currentPage === 1 ? 0.5 : 1,
          mr: 1,
          "&:hover": {
            backgroundColor: "#FFD700",
            opacity: currentPage === 1 ? 0.5 : 0.8,
          },
          "&.Mui-disabled": {
            backgroundColor: "#FFD700",
            color: "black",
          },
        }}
      >
        PREV
      </Button>

      {renderPageNumbers()}

      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === numPages}
        sx={{
          px: 2,
          py: 0.5,
          backgroundColor: "#FFD700",
          color: "black",
          fontWeight: "bold",
          opacity: currentPage === numPages ? 0.5 : 1,
          ml: 1,
          "&:hover": {
            backgroundColor: "#FFD700",
            opacity: currentPage === numPages ? 0.5 : 0.8,
          },
          "&.Mui-disabled": {
            backgroundColor: "#FFD700",
            color: "black",
          },
        }}
      >
        NEXT
      </Button>
    </Box>
  );
}

function TransactionContent({data}: UseQueryResult<Array<Types.Transaction>>) {
  if (!data) {
    // TODO: error handling!
    return null;
  }

  return <TransactionsTable transactions={data} />;
}

function TransactionsPageInner({data}: UseQueryResult<Types.IndexResponse>) {
  const maxVersion = parseInt(data?.ledger_version ?? "");
  const limit = LIMIT;
  const [state] = useGlobalState();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");

  let start = maxStart(maxVersion, limit);
  const startParam = searchParams.get("start");
  if (startParam !== null) {
    start = parseInt(startParam);
  }

  const result = useQuery({
    queryKey: ["transactions", {start, limit}, state.network_value],
    queryFn: () => getTransactions({start, limit}, state.aptos_client),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <TransactionContent {...result} />
        </Box>

        <Box sx={{display: "flex", justifyContent: "center"}}>
          <RenderPagination currentPage={currentPage} numPages={NUM_PAGES} />
        </Box>
      </Stack>
    </>
  );
}

export default function AllTransactions() {
  const [state] = useGlobalState();

  const result = useQuery({
    queryKey: ["ledgerInfo", state.network_value],
    queryFn: () => getLedgerInfo(state.aptos_client),
    refetchInterval: 10000,
  });

  return <TransactionsPageInner {...result} />;
}
