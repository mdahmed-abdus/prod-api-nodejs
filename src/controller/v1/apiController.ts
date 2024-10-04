import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Request, Response } from 'express'
import responseMessage from '../../constant/responseMessage'
import catchAsyncError from '../../errors/catchAsyncError'
import { IUser } from '../../types/userTypes'
import httpResponse from '../../utils/httpResponse'
import quicker from '../../utils/quicker'

dayjs.extend(utc)

interface ISelfIdentificationRequest extends Request {
  authenticatedUser: IUser
}

export const self = catchAsyncError((req: Request, res: Response) => {
  httpResponse(req, res, 200, responseMessage.SUCCESS)
})

export const identify = catchAsyncError((req: Request, res: Response) => {
  const { authenticatedUser } = req as ISelfIdentificationRequest
  httpResponse(req, res, 200, responseMessage.SUCCESS, authenticatedUser)
})

export const health = catchAsyncError((req: Request, res: Response) => {
  const healthData = {
    application: quicker.getApplicationHealth(),
    system: quicker.getSystemHealth(),
    timeStamp: Date.now()
  }
  httpResponse(req, res, 200, responseMessage.SUCCESS, healthData)
})
