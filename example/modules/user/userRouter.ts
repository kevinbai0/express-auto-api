import express from "express"
import { createEndpoint, validateBody } from "../../../src/core"
import * as controller from "./userController"
import { User } from "../../database/models/User"

export const userRouter = express.Router()

userRouter.post(
  `/register`,
  createEndpoint(controller.register).validate([
    validateBody(["username", "password", "secret"]),
    req => [(req.body.username?.length || 0) > 4, "Username length is too short"]
  ])
)

userRouter.post(`/login`, createEndpoint(controller.login).validate([validateBody(["username", "password"])]))

userRouter.get("/authorize", createEndpoint(controller.authorize, { auth: User }).init())
