import ts from "typescript"
import { EndpointBuilderResultKeys } from "./consts"
import isEqual from "lodash/isEqual"

/**
 * Check if is of type Handler[]
 * type Handler<Res = {}, Req extends IRequest = IRequest> = (
 *    req: IExpressRequest<Req>,
 *    res: IExpressResponse<IResponse<Res | undefined>>,
 *    next: NextFunction
 * ) => Promise<void> | void
 * @param property
 * @param node
 * @param typeChecker
 */
const isTypeHandlerArray = (property: ts.Symbol, node: ts.Node, typeChecker: ts.TypeChecker) => {
  const propertyType = typeChecker.getTypeOfSymbolAtLocation(property, node)

  if (propertyType.flags != ts.TypeFlags.Object) {
    return false
  }
  // if object, should be of type TypeReference
  if ((propertyType as ts.ObjectType).objectFlags != ts.ObjectFlags.Reference) {
    return false
  }
  // TODO(kevin): need to typecheck Handler[]
  return true
}

const isEndpointBuilderResult = (node: ts.Node, typeChecker: ts.TypeChecker) => {
  const type = typeChecker.getTypeAtLocation(node)
  /*
   *  It should have 1 call signature with return type of below
   *  type EndpointBuilderResult = () => {
   *    Handler[],
   *     subendpoints, EndpointBuilderResult[],
   *    endpoints: Record<string, EndpointMethod<unknown, IRequest>>
   *   }
   */
  const callSignatures = type.getCallSignatures()
  if (callSignatures.length != 1) {
    return false
  }
  const returnType = callSignatures[0].getReturnType()
  const properties = returnType.getProperties()
  const names = properties.map(prop => prop.name).sort()
  if (!isEqual(names, EndpointBuilderResultKeys)) {
    return false
  }

  // check each property for the right type
  for (const property of properties) {
    if (property.name == "middleware") {
      // middleware type should be Handler[]
      if (!isTypeHandlerArray(property, node, typeChecker)) {
        return false
      }
    }
    // TODO(kevin): need typecheck subendpoints & endpoints
  }

  return true
}

export const isCreateExpressApplication = (node: ts.CallExpression, typeChecker: ts.TypeChecker) => {
  const type = typeChecker.getTypeAtLocation(node)
  const correctArguments = 0 < node.arguments.length && node.arguments.length <= 2

  // if it is createApp, type of the node should be Void && have 1 or 2 arguments
  if (type.flags == ts.TypeFlags.Void && correctArguments) {
    // check if the first argument is type EndpointBuilderResult
    return isEndpointBuilderResult(node.arguments[0], typeChecker)
  }
  return false
}
