export enum ResponseErrorType {
  NOT_FOUND = "Not Found",
  INVALID_INPUT = "Invalid Input",
  UNHANDLED = "Unhandled",
  TOO_MANY_REQUESTS = "Too Many Requests",
  SERVICE_UNAVAILABLE = "Service Unavailable",
  COMPILATION_ERROR = "Compilation Error",
}

export type ResponseError = {type: ResponseErrorType; message?: string};

export async function withResponseError<T>(promise: Promise<T>): Promise<T> {
  return await promise.catch((error) => {
    console.error("ERROR!", error, typeof error);
    if (typeof error == "object" && "status" in error) {
      // This is a request!
      error = error as Response;
      if (error.status === 404) {
        throw {type: ResponseErrorType.NOT_FOUND};
      }
      if (error.status === 503) {
        throw {type: ResponseErrorType.SERVICE_UNAVAILABLE};
      }
    }
    if (
      error.message
        .toLowerCase()
        .includes(ResponseErrorType.TOO_MANY_REQUESTS.toLowerCase())
    ) {
      throw {
        type: ResponseErrorType.TOO_MANY_REQUESTS,
      };
    }

    throw {
      type: ResponseErrorType.UNHANDLED,
      message: error.toString(),
    };
  });
}

export interface ModuleVerificationStatusResponse {
  verified: boolean;
}

/** Fetch module verification status. 
 * Throws:
 * - NOT_FOUND (404) - no source code available
 * - SERVICE_UNAVAILABLE (503) - verification disabled on node
 * - COMPILATION_ERROR (422) - cannot verify (e.g., unsupported dependencies)
 */
export async function getModuleVerificationStatus(
  nodeUrl: string,
  address: string,
  moduleName: string,
): Promise<ModuleVerificationStatusResponse> {
  const url = `${nodeUrl}/v1/accounts/${address}/modules/${moduleName}/verification_status`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw {type: ResponseErrorType.NOT_FOUND};
    }
    if (response.status === 422) {
      // Compilation error - can't verify, but not suspicious
      const errorData = await response.json().catch(() => ({}));
      throw {type: ResponseErrorType.COMPILATION_ERROR, message: errorData.message};
    }
    if (response.status === 503) {
      throw {type: ResponseErrorType.SERVICE_UNAVAILABLE};
    }
    throw {
      type: ResponseErrorType.UNHANDLED,
      message: `HTTP error! status: ${response.status}`,
    };
  }

  return await response.json();
}
