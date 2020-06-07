import { nanoid } from "nanoid"
import { generateToken, TokenType } from "../../auth"
import { createUserModel, User } from "../../database/models/User"
import { comparePassword } from "../../utils/password"
import { IUserLoginEndpoint, IUserRegisterEndpoint } from "./userTypes"

export const register: IUserRegisterEndpoint = async ({ req, error }) => {
  if (req.body.username.length < 4 || req.body.password.length < 8) {
    return error.badRequest(new Error("Username or password too short"))
  }
  if (req.body.secret !== process.env.SECRET) {
    await error.badRequest(new Error("Incorrect secret"))
  }

  const id = nanoid()

  const user = await User.create({
    id,
    username: req.body.username,
    password: req.body.password,
    refresh_token: generateToken(id, TokenType.REFRESH_TOKEN)
  })

  return {
    access_token: generateToken(id, TokenType.ACCESS_TOKEN),
    user: createUserModel(user)
  }
}

export const login: IUserLoginEndpoint = async ({ req, error }) => {
  const { username, password } = req.body
  const user = await User.findOne({
    where: { username }
  })
  if (!user) {
    return error.badRequest(new Error("Invalid username/password"))
  }

  if (!(await comparePassword(password, user.get("password")))) {
    return error.badRequest(new Error("Invalid username/password"))
  }

  const access_token = generateToken(user.get("id"), TokenType.ACCESS_TOKEN)

  return {
    user,
    access_token
  }
}
