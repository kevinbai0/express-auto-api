import dotenv from "dotenv"
dotenv.config({ path: "../.env" })

import bodyParser from "body-parser"
import express from "express"
import logger from "express-pino-logger"
import "./auth"
import { Database } from "./database"
import { User } from "./database/models/User"
import { rootRouter } from "./modules/root/rootRouter"

const db = Database.get()

async function startApp() {
  await db.start([User])

  const app = express()

  app.use(logger())
  app.use(bodyParser.json())
  app.use(`/api`, rootRouter)

  app.listen(9000)
}

startApp()
