import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextFunction, Request, Response } from 'express'
import responseMessage from '../../constant/responseMessage'
import { IUser } from '../../types/userTypes'
import httpError from '../../utils/httpError'
import httpResponse from '../../utils/httpResponse'
import quicker from '../../utils/quicker'

dayjs.extend(utc)

interface ISelfIdentificationRequest extends Request {
  authenticatedUser: IUser
}

export const self = (req: Request, res: Response, next: NextFunction) => {
  try {
    httpResponse(req, res, 200, responseMessage.SUCCESS)
  } catch (error) {
    httpError(next, error, req, 500)
  }
}

export const identify = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authenticatedUser } = req as ISelfIdentificationRequest
    httpResponse(req, res, 200, responseMessage.SUCCESS, authenticatedUser)
  } catch (error) {
    httpError(next, error, req, 500)
  }
}

export const health = (req: Request, res: Response, next: NextFunction) => {
  try {
    const healthData = {
      application: quicker.getApplicationHealth(),
      system: quicker.getSystemHealth(),
      timeStamp: Date.now()
    }
    httpResponse(req, res, 200, responseMessage.SUCCESS, healthData)
  } catch (error) {
    httpError(next, error, req, 500)
  }
}
