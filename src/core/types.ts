import { Request, Response } from "express"
import { Model } from "sequelize/types"

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE"
}

export interface IRequest<
  Params extends Record<string, string>,
  Body extends Record<string, unknown>,
  Query extends {}
> {
  type: HttpMethod
  params: Params
  body: Body
  query: Query
}

export interface IResponse<Body> {
  data?: Body
  success: boolean
  status: ErrorStatus
  error?: string
}

export type IExpressRequest<Req extends IRequest<{}, {}, {}>> = Request<
  Req["params"],
  unknown,
  Req["body"],
  Req["query"]
>
export type IExpressResponse<Res extends IResponse<unknown>> = Response<Res>

export interface IGetRequest<Params extends Record<string, string>, Query> extends IRequest<Params, {}, Query> {
  type: HttpMethod.GET
}
export interface IPostRequest<Params extends Record<string, string>, Body extends Record<string, unknown>>
  extends IRequest<Params, Body, {}> {
  type: HttpMethod.POST
}
export interface IPutRequest<Params extends Record<string, string>, Body extends Record<string, unknown>>
  extends IRequest<Params, Body, {}> {
  type: HttpMethod.PUT
}
export interface IDeleteRequest<Params extends Record<string, string>, Body extends Record<string, unknown>>
  extends IRequest<Params, Body, {}> {
  type: HttpMethod.DELETE
}

export type IExpressEndpointHandler<Req extends IRequest<{}, {}, {}>, Res, T = Model> = (options: {
  req: IExpressRequest<Req>
  res: IExpressResponse<IResponse<Res>>
  error: IErrorStatusMethods
  user: T | null
  token: string | null
}) => Promise<Res | IErrorStatus>

export enum ErrorStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

export type IErrorStatus = {
  isError: true
  type: ErrorStatus
  error?: Error
}

export type IErrorStatusMethods = {
  forbidden: (err?: Error) => IErrorStatus
  unauthorized: (err?: Error) => IErrorStatus
  badRequest: (err?: Error) => IErrorStatus
  notFound: (err?: Error) => IErrorStatus
  internalError: (err?: Error) => IErrorStatus
}

export type IRequestValidation<Req extends IRequest<{}, {}, {}>> = (
  data: IExpressRequest<Req>
) => boolean | [boolean, string]