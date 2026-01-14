import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {
  getModuleVerificationStatus,
  ModuleVerificationStatusResponse,
  ResponseError,
  ResponseErrorType,
} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

/** Hook to query module bytecode verification status. */
export function useGetModuleVerificationStatus(
  address: string,
  moduleName: string,
  options?: {enabled?: boolean},
): UseQueryResult<ModuleVerificationStatusResponse, ResponseError> {
  const [state] = useGlobalState();

  return useQuery<ModuleVerificationStatusResponse, ResponseError>({
    queryKey: [
      "moduleVerificationStatus",
      {address, moduleName},
      state.network_value,
    ],
    queryFn: () =>
      getModuleVerificationStatus(state.network_value, address, moduleName),
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry for expected error types
      if (
        error.type === ResponseErrorType.NOT_FOUND ||
        error.type === ResponseErrorType.SERVICE_UNAVAILABLE ||
        error.type === ResponseErrorType.COMPILATION_ERROR
      ) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}

