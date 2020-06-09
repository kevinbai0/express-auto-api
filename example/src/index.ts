import dotenv from "dotenv"
dotenv.config({ path: "../.env" })

import bodyParser from "body-parser"
import { IGetRequest } from "../../src/core/types"
import { Handler } from "../../src/core/coreTypes"
import { createEndpoint, createEndpoints } from "../../src/core/core"
import { createApp } from "../../src/core"

const coolStuff: Handler<{ stuff: string }, IGetRequest> = (_, res) => {
  res.send({
    status: 400,
    success: false,
    error: "Bad request"
  })
}

const getUser: Handler<"hello", IGetRequest> = (_, res) => {
  res.send({
    data: "hello",
    success: true,
    status: 200
  })
}

const createUser: Handler<undefined> = (_, res) => {
  res.send({
    success: true,
    status: 200
  })
}

const errorThrower: Handler = () => {
  throw Error("this is a test error")
}

const otherEndpoints = createEndpoints().endpoints({
  CoolStuff: createEndpoint("GET", "/other-stuff", coolStuff)
})

const appEndpoints = createEndpoints()
  .middleware(bodyParser.json())
  .subendpoints(otherEndpoints)
  .endpoints({
    GetUser: createEndpoint<"hello">("GET", "/get-stuff", getUser),
    CreateUser: createEndpoint("POST", "/post-stuff", createUser),
    ErrorEndpoint: createEndpoint("GET", "/error-endpoint", errorThrower)
  })

createApp(appEndpoints)
