import React from "react";
import {Box, TableCell, TableRow} from "@mui/material";

interface TablePaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}
export function TablePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}: TablePaginationProps) {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          style={{
            padding: "4px 12px",
            margin: "0 4px",
            backgroundColor: "transparent",
            border: "none",
            color: "#FFD700",
            cursor: "pointer",
            borderBottom: currentPage === i ? "2px solid #FFD700" : "none",
            fontWeight: currentPage === i ? "bold" : "normal",
          }}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      pageNumbers.push(
        <span key="ellipsis" style={{color: "#FFD700", padding: "0 8px"}}>
          ...
        </span>,
      );
    }

    return pageNumbers;
  };

  return (
    <TableRow>
      <TableCell colSpan={5} style={{border: "none"}}>
        <Box display="flex" justifyContent="center" alignItems="center" py={2}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "4px 16px",
              backgroundColor: currentPage === 1 ? "#FFD700" : "#FFD700",
              opacity: currentPage === 1 ? 0.5 : 1,
              border: "none",
              borderRadius: "4px",
              color: "black",
              fontWeight: "bold",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              marginRight: "8px",
            }}
          >
            PREV
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "4px 16px",
              backgroundColor:
                currentPage === totalPages ? "#FFD700" : "#FFD700",
              opacity: currentPage === totalPages ? 0.5 : 1,
              border: "none",
              borderRadius: "4px",
              color: "black",
              fontWeight: "bold",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              marginLeft: "8px",
            }}
          >
            NEXT
          </button>
        </Box>
      </TableCell>
    </TableRow>
  );
}
