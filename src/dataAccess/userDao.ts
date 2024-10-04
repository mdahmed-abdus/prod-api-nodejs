import userModel from '../model/userModel'
import { IUser } from '../types/userTypes'

export default {
  registerUser: (payload: IUser) => userModel.create(payload),

  findUserById: (id: string, select: string = '') =>
    userModel.findById(id).select(select),

  findUserByEmail: (email: string, select: string = '') =>
    userModel.findOne({ email }).select(select),

  findUserByConfirmationTokenAndCode: (token: string, code: string) =>
    userModel.findOne({
      'accountConfirmation.token': token,
      'accountConfirmation.code': code
    }),

  findUserByResetToken: (token: string) =>
    userModel.findOne({ 'passwordReset.token': token })
}
