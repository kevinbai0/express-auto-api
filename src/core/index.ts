import { Response } from "express"
import isEqual from "lodash/isEqual"
import {
  IErrorStatusMethods,
  IExpressEndpointHandler,
  IRequest,
  IErrorStatus,
  ErrorStatus,
  IExpressResponse,
  IResponse,
  IExpressRequest
} from "./types"
import { createErrorStatus, prefixErrorMessage } from "./errors"

const errorStatus: IErrorStatusMethods = {
  forbidden: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.FORBIDDEN, err)),
  unauthorized: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.UNAUTHORIZED, err)),
  badRequest: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.BAD_REQUEST, err)),
  notFound: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.NOT_FOUND, err)),
  internalError: (err?: Error) => Promise.resolve(createErrorStatus(ErrorStatus.INTERNAL_ERROR, err))
}

export const sendErrorResponse = <T, S extends IRequest>(
  req: IExpressRequest<S>,
  res: Response<IResponse<T>>,
  status: ErrorStatus,
  error?: Error
) => {
  req.log.error(error ? JSON.stringify(error) : prefixErrorMessage(status))
  req.log.debug(error ? JSON.stringify(error) : prefixErrorMessage(status))
  return res
    .status(status)
    .send({
      success: false,
      status,
      error: prefixErrorMessage(status, error?.message)
    })
    .end()
}

export const createEndpoint = <Req extends IRequest = IRequest, Res = {}>(
  endpoint: IExpressEndpointHandler<Req, Res>
) => {
  return async (req: IExpressRequest<Req>, res: IExpressResponse<IResponse<Res>>) => {
    try {
      const result = await endpoint({
        req,
        res,
        error: errorStatus
      })
      const asError = result as IErrorStatus
      if (typeof result === "object" && asError.isError) {
        return sendErrorResponse(req, res, asError.type, asError.error)
      }
      return sendSuccessResponse(res, result as Res)
    } catch (err) {
      return sendErrorResponse(req, res, ErrorStatus.INTERNAL_ERROR, err)
    }
  }
}

export const sendSuccessResponse = <T>(res: IExpressResponse<IResponse<T>>, data: T) =>
  res
    .status(200)
    .send({
      success: true,
      data,
      status: 200
    })
    .end()

export const validateBody = <Req extends IRequest>(
  keys: (keyof Req["body"])[],
  optionalKeys?: (keyof Req["body"])[]
) => {
  return (req: IExpressRequest<Req>): [boolean, string] => {
    const bodyKeys = Object.keys(req.body) as (keyof Req["body"])[]
    const keysAsMap = keys.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof Req["body"], boolean>)
    const optionalKeysAsMap = optionalKeys?.reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof Req["body"], boolean>
    )

    const badKeys = keys.filter(key => !req.body[key])
    if (badKeys.length) {
      return [false, `Expected "${badKeys[0]}" but "${badKeys[0]} isn't passed`]
    }
    const remainingKeys = bodyKeys.filter(key => !keysAsMap[key])
    const shouldBeEmpty = remainingKeys.filter(key => !optionalKeysAsMap?.[key])
    if (shouldBeEmpty.length) {
      return [false, `Unexpected keys [${shouldBeEmpty.join(", ")}] found`]
    }
    return [true, ""]
  }
}

export const verifyObject = (body: object, keys: (string | number | symbol)[]) => {
  const sortedDestructured = keys.sort()
  const sortedBody = Object.keys(body).sort()

  return isEqual(sortedDestructured, sortedBody)
}

export const buildProto = <T>(data: Partial<T>) => data as T
