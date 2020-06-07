import { readFileSync } from "fs"
import flattenDeep from "lodash/flattenDeep"
import path from "path"
import ts from "typescript"
import lint from "eslint"
import { createDirRecursive, isDirectory, listDir, writeFile } from "./fs"
const appRoot = path.resolve(__dirname, "../..", "./src")
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

const availableASTTypes = [
  ts.isTypeAliasDeclaration,
  ts.isInterfaceDeclaration,
  ts.isEnumDeclaration,
  ts.isImportDeclaration,
  ts.isSourceFile
]

const transfomer = <T extends ts.Node>(): ts.TransformerFactory<T> => context => {
  const visit: ts.Visitor = node => {
    if (ts.isSourceFile(node)) {
      return ts.visitEachChild(node, child => visit(child), context)
    }
    if (availableASTTypes.filter(type => type(node)).length) {
      return node
    }
    return undefined
  }
  return node => ts.visitNode(node, visit)
}

const createTsProgram = async () => {
  const files = await getFileList("./src")
  const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"))

  const program = ts.createProgram(files, config)
  const printer = ts.createPrinter()

  const output: { result: ts.TransformationResult<ts.SourceFile>; filePath: string; dirPath: string }[] = []

  program.getSourceFiles().map(source => {
    let isValid = false
    ts.forEachChild(source, (node: ts.Node) => {
      if (source.isDeclarationFile || !availableASTTypes.filter(type => !type(node)).length) {
        return
      }
      isValid = true
    })
    if (isValid) {
      const result = ts.transform(source, [transfomer()])
      const relPath = path.join(outputDir, path.relative(appRoot, source.fileName))

      output.push({
        result,
        filePath: relPath,
        dirPath: relPath
          .split("/")
          .slice(0, -1)
          .join("/")
      })
    }
  })

  output.forEach(async ({ result, filePath, dirPath }) => {
    if (!result.transformed[0]) {
      throw new Error("Result doesn't have file")
    }
    console.log(filePath, dirPath)
    await createDirRecursive(dirPath)
    writeFile(filePath, printer.printFile(result.transformed[0]))
  })
}

createTsProgram()
