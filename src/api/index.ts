import { readFileSync } from "fs"
import ts from "typescript"
import { getFileList } from "./fs"
import { generate } from "./generate"

const createTsProgram = async () => {
  const files = await getFileList("./example/src/")
  const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"))

  const program = ts.createProgram(files, config)

  generate(program)
}

createTsProgram()
