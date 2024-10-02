import { compare, hash } from 'bcrypt'
import config from '../config'

export default {
  hashPassword: (password: string) => hash(password, config.HASH_SALT_ROUNDS),

  comparePassword: (password: string, hashedPassword: string) =>
    compare(password, hashedPassword)
}
