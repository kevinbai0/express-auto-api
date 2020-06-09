import express, { Router } from "express"
import { EndpointsBuilderResult } from "./coreTypes"

type MainExpressHttpMethods = "get" | "post" | "put" | "delete"
type OtherHttpMethod =
  | "checkout"
  | "copy"
  | "head"
  | "lock"
  | "merge"
  | "mkactivity"
  | "mkcol"
  | "move"
  | "m-search"
  | "notify"
  | "options"
  | "patch"
  | "purge"
  | "report"
  | "search"
  | "subscribe"
  | "trace"
  | "unlock"
  | "subscribe"

type ExpressHttpMethods = MainExpressHttpMethods | OtherHttpMethod

type IAppConfig = {
  port?: number
}

export function createApp(endpoints: EndpointsBuilderResult, config?: IAppConfig) {
  const app = express()
  app.use(createSubApp(endpoints))

  function createSubApp(builder: EndpointsBuilderResult): Router {
    const router = Router()

    const tree = builder()

    tree.middleware.forEach(middleware => {
      router.use(middleware)
    })

    tree.subendpoints.forEach(result => {
      const subapp = createSubApp(result)
      router.use(subapp)
    })

    Object.values(tree.endpoints).forEach(endpoint => {
      const method = endpoint.method.toLowerCase() as ExpressHttpMethods
      router[method](endpoint.path, endpoint.handlers)
    })

    return router
  }

  // we can do this instead: config?.port || 3000 ok wait but ohh yeah that works
  // app is running and working for me - ohh nice

  // so the backend is pretty much one?
  // I think so for the most part
  // I think we just have cleaning up to do now
  // ohh ok and then we can start the frontend modules later :+1
  const port = config?.port || 3000
  app.listen(port, () => {
    console.log(`Express app listening on port ${port}.`)
  })
}
