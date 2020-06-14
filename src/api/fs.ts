import fs from "fs"
import path from "path"
import flattenDeep from "lodash/flattenDeep"

export const getFileList = async (dir: string): Promise<string[]> => {
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

// fs methods that are promisable

export const listDir = (pathName: string) => {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(pathName, (err, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  })
}

export const isDirectory = (dir: string) => {
  return new Promise<boolean>((resolve, reject) => {
    fs.stat(dir, (err, stats) => {
      if (err) {
        return reject(err)
      }
      resolve(stats.isDirectory())
    })
  })
}

export const dirExists = (dir: string) => {
  return new Promise<boolean>(resolve => {
    fs.exists(dir, exists => {
      resolve(exists)
    })
  })
}

export const createDir = (dir: string) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

export const createDirRecursive = async (newDir: string) => {
  const recurse = async (dir: string[], memo = "/") => {
    const newMemo = dir.length ? path.join(memo, dir[0]) : memo
    try {
      if (!(await dirExists(newMemo))) {
        await createDir(newMemo)
      }
    } catch (err) {
      // do nothing
    }
    if (!dir.length) return
    recurse(dir.slice(1), newMemo)
  }

  recurse(newDir.split("/"))
}

export const writeFile = (filePath: string, contents: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, contents, err => {
      if (err) {
        return reject(err)
      }
    })
  })
}
