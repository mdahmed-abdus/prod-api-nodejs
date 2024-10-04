import refreshTokenModel from '../model/refreshTokenModel'
import { IRefreshToken } from '../types/userTypes'

export default {
  createRefreshToken: (payload: IRefreshToken) =>
    refreshTokenModel.create(payload),

  deleteRefreshToken: (token: string) => refreshTokenModel.deleteOne({ token }),

  getRefreshToken: (token: string) => refreshTokenModel.find({ token })
}
