import {PropsWithChildren} from "react";
import {SxProps, TableRow, useTheme} from "@mui/material";
import {Link} from "../../routing";

export default function GeneralTableRow({
  to,
  ...props
}: PropsWithChildren<{
  to?: string;
  onClick?: () => void;
}>) {
  const theme = useTheme();
  const clickDisabled = !to;
  const sx: SxProps = {
    textDecoration: "none",
    cursor: clickDisabled ? undefined : "pointer",
    userSelect: "none",
    "&:hover:not(:active)": clickDisabled
      ? undefined
      : {
          filter: `${
            theme.palette.mode === "dark"
              ? "brightness(0.9)"
              : "brightness(0.99)"
          }`,
        },
    "&:active": clickDisabled
      ? undefined
      : {
          background: theme.palette.neutralShade.main,
          transform: "translate(0,0.1rem)",
        },

    "& > td:first-of-type": {
      borderTopLeftRadius: "8px",
      borderBottomLeftRadius: "18px",
    },
    "& > td:last-child": {
      borderTopRightRadius: "24px",
      borderBottomRightRadius: "4px",
    },
    marginBottom: "8px",
    backgroundColor: "#151515BF",
  };

  if (to) {
    return <TableRow component={Link} to={to} sx={sx} {...props} />;
  }

  return <TableRow sx={sx} {...props} />;
}
