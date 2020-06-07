import bcrypt from "bcryptjs"

const SALT = 12

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(SALT)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed)
}
