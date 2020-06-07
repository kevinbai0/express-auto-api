import { IUserModel, User } from "../../database/models/User"
import { IExpressEndpointHandler, IGetRequest, IPostRequest } from "../../../src/core/types"

export type IUserRegisterRequest = IPostRequest<
  {},
  {
    username: string
    password: string
    secret: string
  }
>

export type IUserRegisterResponse = {
  access_token: string
  user: IUserModel
}

export type IUserRegisterEndpoint = IExpressEndpointHandler<IUserRegisterRequest, IUserRegisterResponse>

export type IUserLoginRequest = IPostRequest<
  {},
  {
    username: string
    password: string
  }
>

export type IUserLoginResponse = {
  access_token: string
  user: IUserModel
}

export type IUserLoginEndpoint = IExpressEndpointHandler<IUserLoginRequest, IUserLoginResponse>

export type IUserAuthorizeRequest = IGetRequest<{}, {}>

export type IUserAuthorizeResponse = {
  access_token: string
  user: IUserModel
}

export type IUserAuthorizeEndpoint = IExpressEndpointHandler<IUserAuthorizeRequest, IUserAuthorizeResponse, User>
