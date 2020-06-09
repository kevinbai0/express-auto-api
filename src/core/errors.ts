import { ErrorStatus, IErrorStatus, IResponse, IErrorStatusMethods } from "./types"

export const createErrorStatus = (type: ErrorStatus, error?: Error): IErrorStatus => ({
  isError: true,
  type,
  error
})

export const errorStatus: IErrorStatusMethods = {
  forbidden: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.FORBIDDEN, err)),
  unauthorized: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.UNAUTHORIZED, err)),
  badRequest: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.BAD_REQUEST, err)),
  notFound: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.NOT_FOUND, err)),
  internalError: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.INTERNAL_ERROR, err))
}

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
