import { NextFunction, Request, Response } from 'express'
import config from '../config'
import responseMessage from '../constant/responseMessage'
import userDao from '../dataAccess/userDao'
import tokenService from '../service/tokenService'
import { IDecryptedJwt } from '../types/tokenTypes'
import { IUser } from '../types/userTypes'
import httpError from '../utils/httpError'

interface IAuthenticatedRequest extends Request {
  authenticatedUser: IUser
}

export default async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const request = req as IAuthenticatedRequest

    const { cookies } = request
    const { accessToken } = cookies as { accessToken: string | undefined }

    if (!accessToken) {
      return httpError(
        next,
        new Error(responseMessage.UNAUTHORIZED),
        request,
        401
      )
    }

    const { userId } = tokenService.verifyToken(
      accessToken,
      config.ACCESS_TOKEN.ACCESS_TOKEN_SECRET
    ) as IDecryptedJwt

    const user = await userDao.findUserById(userId)
    if (!user) {
      return httpError(
        next,
        new Error(responseMessage.UNAUTHORIZED),
        request,
        401
      )
    }

    request.authenticatedUser = user
    return next()
  } catch (error) {
    return httpError(next, error, req, 500)
  }
}
