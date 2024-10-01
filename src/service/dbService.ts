import mongoose from 'mongoose'
import config from '../config/config'
import refreshModelToken from '../model/refreshModelToken'
import userModel from '../model/userModel'
import { IRefreshToken, IUser } from '../types/userTypes'

export default {
  connect: async () => {
    try {
      await mongoose.connect(config.DATABASE_URL as string)
      return mongoose.connection
    } catch (error) {
      throw error
    }
  },
  findUserById: (id: string) => userModel.findById(id),
  findUserByEmail: (email: string, select: string = '') => userModel.findOne({ email }).select(select),
  registerUser: (payload: IUser) => userModel.create(payload),
  findUserByConfirmationTokenAndCode: (token: string, code: string) =>
    userModel.findOne({ 'accountConfirmation.token': token, 'accountConfirmation.code': code }),
  createRefreshToken: (payload: IRefreshToken) => refreshModelToken.create(payload),
  deleteRefreshToken: (token: string) => refreshModelToken.deleteOne({ token })
}
