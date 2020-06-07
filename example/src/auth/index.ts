import jwt from "jsonwebtoken"
import passport from "passport"
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt"
import { User } from "../database/models/User"
import { ErrorStatus } from "../../../src/core/types"
import { createErrorMessage } from "../../../src/core/errors"

const SECRET_KEY = "test"

passport.use(
  new JWTStrategy(
    {
      secretOrKey: SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async (jwtPayload, done) => {
      try {
        const { id } = jwtPayload
        const user = await User.findByPk(id)
        if (user) {
          return done(null, user)
        }
        return done(createErrorMessage(ErrorStatus.UNAUTHORIZED))
      } catch (err) {
        return done(createErrorMessage(ErrorStatus.INTERNAL_ERROR, err))
      }
    }
  )
)

export enum TokenType {
  ACCESS_TOKEN = "ACCESS_TOKEN",
  REFRESH_TOKEN = "REFRESH_TOKEN"
}

export const generateToken = (id: string, token: TokenType) => {
  const duration = (() => {
    switch (token) {
      case TokenType.ACCESS_TOKEN:
        return "10m"
      case TokenType.REFRESH_TOKEN:
        return "7d"
    }
  })()

  return jwt.sign({ id }, SECRET_KEY, {
    expiresIn: duration
  })
}
