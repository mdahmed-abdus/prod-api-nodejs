import { NextFunction, Request, Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import config from '../config/config'
import responseMessage from '../constant/responseMessage'
import dbService from '../service/dbService'
import { IUser } from '../types/userTypes'
import httpError from '../utils/httpError'
import quicker from '../utils/quicker'

interface IAuthenticatedRequest extends Request {
  authenticatedUser: IUser
}

interface IDecryptedJwt extends JwtPayload {
  userId: string
  userRole: string
}

export default async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const request = req as IAuthenticatedRequest

     
    const { cookies } = request
    const { accessToken } = cookies as { accessToken: string | undefined }

    if (!accessToken) {
      return httpError(next, new Error(responseMessage.UNAUTHORIZED), request, 401)
    }

    const { userId } = quicker.verifyToken(accessToken, config.ACCESS_TOKEN.ACCESS_TOKEN_SECRET as string) as IDecryptedJwt

    const user = await dbService.findUserById(userId)
    if (!user) {
      return httpError(next, new Error(responseMessage.UNAUTHORIZED), request, 401)
    }

    request.authenticatedUser = user
    return next()
  } catch (error) {
    return httpError(next, error, req, 500)
  }
}
