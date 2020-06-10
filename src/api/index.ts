import { readFileSync } from "fs"
import flattenDeep from "lodash/flattenDeep"
import path from "path"
import ts from "typescript"
import { createDirRecursive, isDirectory, listDir, writeFile } from "./fs"
const appRoot = path.resolve(__dirname, "../..", "example", "src")
const outputDir = path.resolve(__dirname, "../..", "out", "data")

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

const availableASTTypes = [ts.isTypeAliasDeclaration, ts.isInterfaceDeclaration, ts.isEnumDeclaration, ts.isSourceFile]

const transfomer = <T extends ts.Node>(): ts.TransformerFactory<T> => context => {
  const visit: ts.Visitor = node => {
    if (ts.isSourceFile(node)) {
      return ts.visitEachChild(node, child => visit(child), context)
    } else if (availableASTTypes.filter(type => type(node)).length) {
      return node
    } else if (ts.isCallExpression(node)) {
      console.log(node.expression)
      if (node.expression.getSourceFile()) {
        const expression = node.expression.getText()
        if (expression === "createEndpoint") {
          if (ts.isPropertyAssignment(node.parent)) {
            console.log("found!")
            const endpointName = node.parent.name.getText()
            const endpointType = node.arguments[0].getText()
            const endpointPath = node.arguments[1].getText()
            const endpointHandler = node.arguments[2]
            const generatedFunction = ts.createFunctionDeclaration(
              undefined,
              undefined,
              undefined,
              endpointName,
              undefined,
              [],
              undefined,
              undefined
            )
            return generatedFunction
          } else {
            return undefined
          }
        }
      }
    } else {
      if (node) {
        return ts.visitEachChild(node, child => visit(child), context)
      } else {
        return undefined
      }
    }
  }
  return node => ts.visitNode(node, visit)
}

const createTsProgram = async () => {
  const files = await getFileList("./example/src/")
  const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"))

  const program = ts.createProgram(files, config)
  const printer = ts.createPrinter()

  const output: {
    result: ts.TransformationResult<ts.SourceFile>
    filePath: string
    dirPath: string
  }[] = []

  program.getSourceFiles().map(source => {
    let isValid = false
    ts.forEachChild(source, (node: ts.Node) => {
      if (source.isDeclarationFile || !availableASTTypes.filter(type => !type(node)).length) {
        return
      }
      isValid = true
    })
    if (isValid) {
      const relPath = path.relative(appRoot, source.fileName)
      const isSrcFile = !!(relPath && !relPath.startsWith("..") && !path.isAbsolute(relPath))
      if (isSrcFile) {
        const result = ts.transform(source, [transfomer()])
        const outPath = path.join(outputDir, relPath)
        // console.log(outPath)
        // console.log(relPath)
        // console.log(source.fileName)
        // console.log(!!(relPath && !relPath.startsWith("..") && !path.isAbsolute(relPath)))

        output.push({
          result,
          filePath: outPath,
          dirPath: outPath
            .split("/")
            .slice(0, -1)
            .join("/")
        })
      }
    }
  })

  output.forEach(async ({ result, filePath, dirPath }) => {
    if (!result.transformed[0]) {
      throw new Error("Result doesn't have file")
    }
    console.log(filePath, dirPath)
    const fileToWrite = printer.printFile(result.transformed[0])
    if (fileToWrite) {
      await createDirRecursive(dirPath)
      writeFile(filePath, fileToWrite)
    }
  })
}

createTsProgram()
