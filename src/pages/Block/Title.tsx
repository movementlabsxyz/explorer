import {Stack, Typography} from "@mui/material";
import React from "react";

export default function BlockTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h4">Block</Typography>
    </Stack>
  );
}
