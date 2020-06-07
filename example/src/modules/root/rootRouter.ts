import express from "express"
import { userRouter } from "../user/userRouter"
import { createEndpoint } from "../../../../src/core"
import { IGetRequest } from "../../../../src/core/types"

export const rootRouter = express.Router()

/**
 * This is a good example of where, you can throw in inline generic types
 * With comments formatting, we could annotate this endpoint as:
 * @endpoint ApiRoot GET /api
 * This assigns this endpoint a name of "APIRoot", a GET request, with path /api
 * Whatever the name is, it'll take the generic arguments (IGetRequest & { message: string })
 * and assign those with the types:
 * type IApiRootRequest = IGetRequest
 * type IApiRootResponse = { message: string }
 * The problem with this is that there's no guarantee that the actual endpoint & http method actually
 * matches up with the comment
 */
rootRouter.get(
  "/",
  createEndpoint<IGetRequest, { message: string }>(async () => ({
    message: "Hello World"
  })).init()
)
rootRouter.use("/users", userRouter)
