import { ErrorStatus, IErrorStatus, IResponse } from "./types"

export const createErrorStatus = (type: ErrorStatus, error?: Error): IErrorStatus => ({
  isError: true,
  type,
  error
})

export const createErrorMessage = (status: ErrorStatus, err?: Error): IResponse<undefined> => {
  return {
    success: false,
    status,
    error: prefixErrorMessage(status, err?.message)
  }
}

export function prefixErrorMessage(status: ErrorStatus, message?: string) {
  const statusMessage = (() => {
    switch (status) {
      case ErrorStatus.BAD_REQUEST:
        return "Bad Request"
      case ErrorStatus.FORBIDDEN:
        return "Forbidden"
      case ErrorStatus.INTERNAL_ERROR:
        return "Internal Server Error"
      case ErrorStatus.NOT_FOUND:
        return "Not Found"
      case ErrorStatus.UNAUTHORIZED:
        return "Unauthorized"
    }
  })()

  return message ? `${statusMessage}: ${message}` : statusMessage
}
