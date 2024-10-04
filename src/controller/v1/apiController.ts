import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Request, Response } from 'express'
import responseMessage from '../../constant/responseMessage'
import catchAsyncError from '../../error/catchAsyncError'
import { IUser } from '../../types/userTypes'
import utils from '../../utils'
import httpResponse from '../../utils/httpResponse'

dayjs.extend(utc)

interface IIdentifyRequest extends Request {
  authenticatedUser: IUser
}

export const self = catchAsyncError((req: Request, res: Response) => {
  httpResponse(req, res, 200, responseMessage.SUCCESS)
})

export const identify = catchAsyncError((req: Request, res: Response) => {
  const { authenticatedUser } = req as IIdentifyRequest
  httpResponse(req, res, 200, responseMessage.SUCCESS, authenticatedUser)
})

export const health = catchAsyncError((req: Request, res: Response) => {
  const healthData = {
    application: utils.getApplicationHealth(),
    system: utils.getSystemHealth(),
    timeStamp: Date.now()
  }
  httpResponse(req, res, 200, responseMessage.SUCCESS, healthData)
})
