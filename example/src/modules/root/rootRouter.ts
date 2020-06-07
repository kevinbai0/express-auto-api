import express from "express"
import { userRouter } from "../user/userRouter"

export const rootRouter = express.Router()

rootRouter.get("/", (_, res) => res.send("API"))
rootRouter.use("/users", userRouter)
