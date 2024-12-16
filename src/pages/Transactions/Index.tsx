import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Box, Button, Stack, Typography} from "@mui/material";
import PageHeader from "../layout/PageHeader";
import AllTransactions from "./AllTransactions";
import UserTransactions from "./UserTransactions";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import {useGlobalState} from "../../global-config/GlobalConfig";

export default function TransactionsPage() {
  const [state] = useGlobalState();
  const [userTxnOnly, setUserTxnOnly] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  useEffect(() => {
    setUserTxnOnly(isGraphqlClientSupported);
  }, [isGraphqlClientSupported, state.network_name]);

  useEffect(() => {
    if (userTxnOnly) {
      searchParams.set("type", "user");
      searchParams.delete("start");
      setSearchParams(searchParams);
    } else {
      searchParams.set("type", "all");
      searchParams.delete("page");
      setSearchParams(searchParams);
    }
  }, [userTxnOnly, searchParams, setSearchParams]);

  const toggleUserTxnOnly = () => {
    setUserTxnOnly(!userTxnOnly);
  };

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
          <PageHeader />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" marginBottom={2}>
              {userTxnOnly ? "User Transactions" : "All Transactions"}
            </Typography>
            {isGraphqlClientSupported && (
              <Button
                onClick={toggleUserTxnOnly}
                variant="text"
                sx={{
                  color: "white",
                  textDecoration: "underline",
                  "&:hover": {
                    textDecoration: "underline",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {userTxnOnly
                  ? `View All Transactions`
                  : `View User Transactions`}
              </Button>
            )}
          </Stack>
        </Box>
        {userTxnOnly ? <UserTransactions /> : <AllTransactions />}
      </Box>
    </Box>
  );
}
