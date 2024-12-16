import * as React from "react";
import BlocksTable from "./Table";
import {useGetMostRecentBlocks} from "../../api/hooks/useGetMostRecentBlocks";
import {Box, Typography} from "@mui/material";
import PageHeader from "../layout/PageHeader";
import LoadingModal from "../../components/LoadingModal";

const BLOCKS_COUNT = 30;

export default function BlocksPage() {
  const {recentBlocks, isLoading} = useGetMostRecentBlocks(BLOCKS_COUNT);

  return (
    <>
      <LoadingModal open={isLoading} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box sx={{width: "86%"}}>
          <PageHeader />
          <Typography variant="h4" marginBottom={2}>
            Latest Blocks
          </Typography>
          <BlocksTable blocks={recentBlocks} />
        </Box>
      </Box>
    </>
  );
}
