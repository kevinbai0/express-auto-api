import { readFileSync } from "fs"
import flattenDeep from "lodash/flattenDeep"
import path from "path"
import ts from "typescript"
import { isDirectory, listDir } from "./fs"
import isEqual from "lodash/isEqual"
import { EndpointBuilderResultKeys } from "./consts"

const getFileList = async (dir: string): Promise<string[]> => {
  const dirs = await listDir(dir)
  const folder = await Promise.all(
    dirs.map(async fileName => {
      const newPath = path.join(dir, fileName)
      if (await isDirectory(newPath)) {
        return await getFileList(newPath)
      }
      return newPath
    })
  )

  return flattenDeep(folder)
}

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

const isCreateExpressApplication = (node: ts.CallExpression, typeChecker: ts.TypeChecker) => {
  const type = typeChecker.getTypeAtLocation(node)
  const correctArguments = 0 < node.arguments.length && node.arguments.length <= 2

  // if it is createApp, type of the node should be Void && have 1 or 2 arguments
  if (type.flags == ts.TypeFlags.Void && correctArguments) {
    // check if the first argument is type EndpointBuilderResult
    return isEndpointBuilderResult(node.arguments[0], typeChecker)
  }
  return false
}

function visit(node: ts.Node, typeChecker: ts.TypeChecker) {
  if (!ts.isCallExpression(node)) {
    node.forEachChild(node => visit(node, typeChecker))
    return
  }

  // every call expression might be a createApp, so we need to check
  if (isCreateExpressApplication(node, typeChecker)) {
    // do something
  }
}

const createTsProgram = async () => {
  const files = await getFileList("./example/src/")
  const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"))

  const program = ts.createProgram(files, config)
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

createTsProgram()
