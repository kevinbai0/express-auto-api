import { BuildOptions, Model, Sequelize } from "sequelize"

export type ModelStatic<T> = typeof Model & {
  new (values?: object, options?: BuildOptions): T
}

export class Database {
  private static instance: Database | null
  static get() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  private sequelizeInstance: Sequelize

  constructor() {
    this.sequelizeInstance = new Sequelize({
      database: "Example",
      dialect: "mysql",
      username: "root",
      password: "welcome123"
    })
  }

  get sequelize() {
    return this.sequelizeInstance
  }

  async start(models: ModelStatic<Model>[]) {
    await Promise.all(models.map(model => model.sync()))
    await this.sequelizeInstance.sync()
  }
}
