import { IExpressRequest, IExpressResponse, IResponse, IRequest, HttpMethod } from "./types"
import { NextFunction } from "../../example/node_modules/@types/express"

// middleware type?
export type MiddlewareFunction = (
  ...middleware: Handler[]
) => {
  middleware: Handler[]
  subendpoints: SubendpointsFunction
  endpoints: EndpointsFunction
}

export type SubendpointsFunction = (
  ...subendpoints: EndpointsBuilderResult[]
) => {
  middleware: Handler[]
  subendpoints: EndpointsBuilderResult[]
  endpoints: EndpointsFunction
}

export type EndpointsFunction = (endpoints: Record<string, EndpointMethod<unknown, any>>) => EndpointsBuilderResult

export type EndpointsBuilder = () => {
  middleware: MiddlewareFunction
  subendpoints: SubendpointsFunction
  endpoints: EndpointsFunction
}

export type EndpointsBuilderResult = () => {
  middleware: Handler[]
  subendpoints: EndpointsBuilderResult[]
  endpoints: Record<string, EndpointMethod<unknown, IRequest>>
}

export type IHandlerOptions<Res = {}, Req extends IRequest = IRequest> = {
  req: IExpressRequest<Req>
  res: IExpressResponse<IResponse<Res | undefined>>
  next: NextFunction
}
export type Handler<Res = {}, Req extends IRequest = IRequest> = (
  req: IExpressRequest<Req>,
  res: IExpressResponse<IResponse<Res | undefined>>,
  next: NextFunction
) => Promise<void> | void

export type EndpointMethod<Res extends unknown, Req extends IRequest = IRequest> = {
  method: HttpMethod
  path: string
  handlers: Handler<Res, Req>[]
}
