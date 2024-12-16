import Typography from "@mui/material/Typography";
import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
export default function LandingPage() {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box sx={{width: "86%"}}>
          <Typography
            variant="h4"
            component="h4"
            marginBottom={4}
            marginTop={6}
          >
            Movement Explorer
          </Typography>
          <NetworkInfo isOnHomePage />
          <HeaderSearch />
        </Box>
      </Box>
      <UserTransactionsPreview />
    </Box>
  );
}
