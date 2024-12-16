import {Box, Stack, Typography} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h4">Transaction</Typography>
      <Box
        sx={{
          "& .MuiButton-root": {
            backgroundColor: "#000000 !important",
            color: "#FFD700 !important",
            padding: "0.5rem 1rem !important",
            borderRadius: "5px",
            "& .MuiSvgIcon-root": {
              color: "#FFD700 !important",
            },
            "&:hover": {
              backgroundColor: "#000000 !important",
              opacity: 0.8,
            },
          },
        }}
      >
        <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      </Box>
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
