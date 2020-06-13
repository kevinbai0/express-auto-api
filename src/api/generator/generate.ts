import ts from "typescript"
import { isCreateExpressApplication } from "./findCreateApp"

function visit(node: ts.Node, typeChecker: ts.TypeChecker) {
  if (!ts.isCallExpression(node)) {
    node.forEachChild(node => visit(node, typeChecker))
    return
  }

  // every call expression might be a createApp, so we need to check
  if (isCreateExpressApplication(node, typeChecker)) {
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
  sources[0].forEachChild(node => visit(node, typeChecker))

  console.log(sources.map(source => source.fileName))
}
