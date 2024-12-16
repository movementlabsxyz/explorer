import React from "react";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {Button, Stack} from "@mui/material";
import {UserTransactionsTable} from "../Transactions/TransactionsTable";
import useGetUserTransactionVersions from "../../api/hooks/useGetUserTransactionVersions";

const LIMIT = 20;
const NUM_PAGES = 100;

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

export default function UserTransactions() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const offset = (currentPage - 1) * LIMIT;

  const startVersion = useGetUserTransactionVersions(1)[0];
  const versions = useGetUserTransactionVersions(LIMIT, startVersion, offset);

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <UserTransactionsTable versions={versions} />
        </Box>
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <RenderPagination currentPage={currentPage} numPages={NUM_PAGES} />
        </Box>
      </Stack>
    </>
  );
}
