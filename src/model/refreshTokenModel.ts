import mongoose from 'mongoose'
import config from '../config'
import { IRefreshToken } from '../types/tokenTypes'

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

refreshTokenSchema.index(
  { createdAt: -1 },
  { expireAfterSeconds: config.REFRESH_TOKEN.EXPIRY }
)

export default mongoose.model<IRefreshToken>(
  'refresh-token',
  refreshTokenSchema
)
