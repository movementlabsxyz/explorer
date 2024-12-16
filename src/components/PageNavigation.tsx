import * as React from "react";
import {Link as RouterLink, useLocation} from "react-router-dom";
import {Box, Typography, Link} from "@mui/material";

export default function PageNavigation(): JSX.Element {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbs = [
    {name: "Home", path: "/"},
    ...pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join("/")}`;
      const formattedName =
        name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, " ");
      return {name: formattedName, path};
    }),
  ];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 2,
      }}
    >
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <Link
            component={RouterLink}
            to={crumb.path}
            sx={{
              color: "#fff",
              textDecoration: "underline",
              fontSize: "0.8rem",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            {crumb.name}
          </Link>
          {index < breadcrumbs.length - 1 && (
            <Typography
              sx={{
                color: "#fff",
                fontSize: "0.8rem",
              }}
            >
              /
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}
