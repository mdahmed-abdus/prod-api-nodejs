import mongoose from 'mongoose'
import config from '../config/config'
import userModel from '../model/userModel'
import { IUser } from '../types/userTypes'

export default {
  connect: async () => {
    try {
      await mongoose.connect(config.DATABASE_URL as string)
      return mongoose.connection
    } catch (error) {
      throw error
    }
  },
  findUserByEmail: (email: string) => userModel.findOne({ email }),
  registerUser: (payload: IUser) => userModel.create(payload),
  findUserByConfirmationTokenAndCode: (token: string, code: string) =>
    userModel.findOne({ 'accountConfirmation.token': token, 'accountConfirmation.code': code })
}
