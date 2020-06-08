import express from "express"
import { userRouter } from "../user/userRouter"
import { createEndpoint } from "../../../../src/core"

export const rootRouter = express.Router()

// here, the response type is inferred as numebr | "hello"
rootRouter.get(
  "/",
  createEndpoint(async () => {
    if (Math.random() < 0.5) {
      return Math.random()
    }
    return "hello"
  })
)

rootRouter.get(
  "/date",
  createEndpoint(async () => ({ date: new Date() }))
)

rootRouter.use("/users", userRouter)
