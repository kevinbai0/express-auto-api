import ts from "typescript"

export const isEndpointRecord = (node: ts.Expression, typeChecker: ts.TypeChecker) => {
  if (ts.isObjectLiteralExpression(node)) {
    const endpointList = []
    for (const property of node.properties) {
      // TO DO: make type checking more robust
      if (typeChecker.getTypeAtLocation(property).aliasSymbol?.getName() !== "EndpointMethod") {
        return false
      } else {
        endpointList.push({
          node: property.name,
          text: property.getText()
        })
      }
    }
    return endpointList
  }
  return false
}
