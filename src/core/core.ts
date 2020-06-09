import {
  EndpointsBuilderResult,
  SubendpointsFunction,
  Handler,
  EndpointMethod,
  EndpointsFunction,
  MiddlewareFunction,
  EndpointsBuilder
} from "./coreTypes"
import { HttpMethod, IRequest } from "./types"

export function createEndpoint<Res extends unknown, Req extends IRequest = IRequest>(
  method: HttpMethod,
  path: string,
  ...handlers: Handler<Res, Req>[]
): EndpointMethod<Res, Req> {
  return {
    method,
    path,
    handlers
  }
}

export const createEndpoints: EndpointsBuilder = () => {
  const endpointsFunctionBuilder = (
    middleware: Handler[],
    subendpoints: EndpointsBuilderResult[]
  ): EndpointsFunction => {
    return (endpoints: Record<string, EndpointMethod<unknown, any>>) => () => ({
      middleware,
      subendpoints,
      endpoints
    })
  }

  const subendpointsFunctionBuilder = (middleware: Handler[]): SubendpointsFunction => {
    return (...subendpoints: EndpointsBuilderResult[]) => {
      return {
        middleware,
        subendpoints,
        endpoints: endpointsFunctionBuilder(middleware, subendpoints)
      }
    }
  }

  const middlewareFunction: MiddlewareFunction = (...middleware: Handler[]) => {
    return {
      middleware,
      subendpoints: subendpointsFunctionBuilder(middleware),
      endpoints: endpointsFunctionBuilder(middleware, [])
    }
  }

  return {
    middleware: middlewareFunction,
    subendpoints: subendpointsFunctionBuilder([]),
    endpoints: endpointsFunctionBuilder([], [])
  }
}
