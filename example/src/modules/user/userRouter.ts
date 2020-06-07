import express from "express"
import { createEndpoint } from "../../../../src/core"
import * as controller from "./userController"

export const userRouter = express.Router()

userRouter.post(`/register`, createEndpoint(controller.register))
userRouter.post(`/login`, createEndpoint(controller.login))
