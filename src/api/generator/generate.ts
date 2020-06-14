import ts from "typescript"
import { isCreateExpressApplication, isCreateExpressApplication_temporary } from "./findCreateApp"
import { isEndpointRecord } from "./findEndpoints"

function findEndpoints(node: ts.Node, typeChecker: ts.TypeChecker) {
  if (ts.isCallExpression(node) && node.arguments.length > 0) {
    const endpointList = isEndpointRecord(node.arguments[0], typeChecker)
    if (endpointList) {
      for (const endpoint of endpointList) {
        console.log("Found endpoint!")
        console.log(endpoint)
      }
    }
  } else {
    node.forEachChild(node => findEndpoints(node, typeChecker))
  }
}

function findEndpointsBuilderObject(node: ts.Node, typeChecker: ts.TypeChecker) {
  if (!ts.isCallExpression(node)) {
    node.forEachChild(node => findEndpointsBuilderObject(node, typeChecker))
    return
  }

  // every call expression might be a createApp, so we need to check
  if (isCreateExpressApplication_temporary(node, typeChecker)) {
    const appEndpointsBuilderObject = node.arguments[0]
    appEndpointsBuilderObject.getSourceFile().forEachChild(node => findEndpoints(node, typeChecker))
    // the first argument of node is EndpointBuilderResult & we can traverse it's AST to find all subendpoints & endpoints
  }
}

export function generate(program: ts.Program) {
  const typeChecker = program.getTypeChecker()
  // generate AST
  const sources = program
    .getSourceFiles()
    .filter(source => !source.isDeclarationFile)
    .reverse()

  // first source is our root
  sources[0].forEachChild(node => findEndpointsBuilderObject(node, typeChecker))

  console.log(sources.map(source => source.fileName))
}
