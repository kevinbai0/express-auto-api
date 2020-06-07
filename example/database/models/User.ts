import Sequelize, { Model } from "sequelize"
import { Database } from ".."
import { hashPassword } from "../../utils/password"

export class User extends Model {
  public id!: string
  public username!: string
  public password!: string
  public refresh_token?: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

User.init(
  {
    id: { type: Sequelize.STRING(21), allowNull: false, primaryKey: true, unique: true },
    username: { type: Sequelize.STRING(32), allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    refresh_token: { type: Sequelize.STRING }
  },
  {
    sequelize: Database.get().sequelize,
    modelName: "Users"
  }
)

User.beforeCreate(async user => {
  const password = user.getDataValue("password")
  user.setDataValue("password", await hashPassword(password))
})

export interface IUserModel {
  id: string
  username: string
  refresh_token?: string
}

export const createUserModel = (user: User): IUserModel => ({
  id: user.get("id"),
  username: user.get("username"),
  refresh_token: user.get("refresh_token")
})
