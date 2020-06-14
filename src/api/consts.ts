import { EndpointsBuilderResult } from "../core/coreTypes"

export const EndpointBuilderResultKeys: (keyof ReturnType<EndpointsBuilderResult>)[] = [
  "endpoints",
  "middleware",
  "subendpoints"
]
