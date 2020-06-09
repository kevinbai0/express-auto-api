import { IExpressRequest, IResponse, ErrorStatus, IRequest, IExpressResponse } from "./types"
import { prefixErrorMessage } from "./errors"
import isEqual from "lodash/isEqual"

export const sendErrorResponse = <T, S extends IRequest>(
  req: IExpressRequest<S>,
  res: IExpressResponse<IResponse<T>>,
  status: ErrorStatus,
  error?: Error
) => {
  console.error(error)
  return res
    .status(status)
    .send({
      success: false,
      status,
      error: prefixErrorMessage(status, error?.message)
    })
    .end()
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
