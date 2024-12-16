import React from "react";
import {Stack, Typography, useTheme, Box, Grid} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {grey} from "../../themes/colors/aptosColorPalette";

type CollapsibleCardProps = {
  titleKey: string;
  titleValue: string;
  children: React.ReactNode;
  expanded: boolean;
  toggleExpanded: () => void;
  useCustomBackground?: boolean;
};

export default function CollapsibleCard({
  expanded,
  titleKey,
  titleValue,
  children,
  toggleExpanded,
  useCustomBackground = false,
  ...props
}: CollapsibleCardProps) {
  const theme = useTheme();
  // TODO: unify colors for the new transaction page
  const titleBackgroundColor = useCustomBackground
    ? "transparent"
    : theme.palette.mode === "dark"
      ? grey[700]
      : grey[100];
  const contentBackgroundColor = useCustomBackground
    ? "transparent"
    : theme.palette.mode === "dark"
      ? grey[800]
      : grey[50];
  const textColor = useCustomBackground ? "#fff" : grey[450];

  return (
    <Box {...props}>
      <Box
        paddingX={4}
        paddingY={2}
        sx={{
          color: textColor,
          backgroundColor: titleBackgroundColor,
          borderRadius: expanded ? "0px 0px 0px 0px" : "0px 0px 0px 0px",
        }}
        onClick={toggleExpanded}
      >
        <Grid
          container
          direction={{xs: "column", md: "row"}}
          rowSpacing={1}
          columnSpacing={4}
        >
          <Grid item md={3}>
            <Typography variant="body2" color={textColor}>
              {titleKey}
            </Typography>
          </Grid>
          <Grid
            item
            md={9}
            width={{xs: 1, md: 0.75}}
            sx={{
              fontSize: 13.5,
              overflow: "auto",
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              {titleValue}
              {expanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
      {expanded && (
        <Box
          padding={4}
          sx={{
            backgroundColor: contentBackgroundColor,
            borderRadius: "0px 0px 0px 0px",
            color: textColor,
          }}
        >
          <Stack direction="column" spacing={2}>
            {children}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
