import express from "express"
import { userRouter } from "../user/userRouter"
import { createEndpoint } from "../../../../src/core"
import { Middleware } from "../../../../src/core/types"

export const rootRouter = express.Router()

const sampleMiddleware: Middleware<MiddlewareCounter, MiddlewareCounter> = endpoint => middleware => options => {
  return endpoint({
    count: (middleware?.count ?? 0) + 1
  })(options)
}

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
  createEndpoint(
    sampleMiddleware(
      sampleMiddleware(middleware => async () => {
        return {
          middlewares: middleware?.count ?? -1
        }
      })
    )
  )
)
rootRouter.use("/users", userRouter)

type MiddlewareCounter = {
  count: number
}
