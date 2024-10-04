import { JwtPayload } from 'jsonwebtoken'
import { EUserRole } from '../constant/userConstant'

export interface IRefreshToken {
  token: string
}

export interface IDecryptedJwt extends JwtPayload {
  userId: string
  userRole: EUserRole
}
