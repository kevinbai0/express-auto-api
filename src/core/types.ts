import { Request, Response } from "express"

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE"
}

export interface IRequest<Params = Record<string, string>, Body = Record<string, unknown>, Query = {}> {
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

export type IExpressRequest<Req extends IRequest = IRequest> = Request<
  Req["params"],
  unknown,
  Req["body"],
  Req["query"]
>
export type IExpressResponse<Res extends IResponse<unknown>> = Response<Res>

export interface IGetRequest<Params = Record<string, string>, Query = {}> extends IRequest<Params, {}, Query> {
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

export type IExpressEndpointHandlerOptions<Req extends IRequest = IRequest, Res = {}> = {
  req: IExpressRequest<Req>
  res: IExpressResponse<IResponse<Res>>
  error: IErrorStatusMethods
}

export type IExpressEndpointHandler<Req extends IRequest = IRequest, Res = {}> = (
  options: IExpressEndpointHandlerOptions<Req, Res>
) => Promise<Res | IErrorStatus>

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
  forbidden: (err?: Error) => Promise<IErrorStatus>
  unauthorized: (err?: Error) => Promise<IErrorStatus>
  badRequest: (err?: Error) => Promise<IErrorStatus>
  notFound: (err?: Error) => Promise<IErrorStatus>
  internalError: (err?: Error) => Promise<IErrorStatus>
}

export type IRequestValidation<Req extends IRequest<{}, {}, {}>> = (
  data: IExpressRequest<Req>
) => boolean | [boolean, string]
