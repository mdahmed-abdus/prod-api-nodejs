import mongoose from 'mongoose'
import config from '../config'
import refreshTokenModel from '../model/refreshTokenModel'
import userModel from '../model/userModel'
import { IRefreshToken, IUser } from '../types/userTypes'

export default {
  connect: async () => {
    await mongoose.connect(config.DATABASE_URL)
  },
  findUserById: (id: string, select: string = '') =>
    userModel.findById(id).select(select),
  findUserByEmail: (email: string, select: string = '') =>
    userModel.findOne({ email }).select(select),
  registerUser: (payload: IUser) => userModel.create(payload),
  findUserByConfirmationTokenAndCode: (token: string, code: string) =>
    userModel.findOne({
      'accountConfirmation.token': token,
      'accountConfirmation.code': code
    }),
  createRefreshToken: (payload: IRefreshToken) =>
    refreshTokenModel.create(payload),
  deleteRefreshToken: (token: string) => refreshTokenModel.deleteOne({ token }),
  getRefreshToken: (token: string) => refreshTokenModel.find({ token }),
  findUserByResetToken: (token: string) =>
    userModel.findOne({ 'passwordReset.token': token })
}
