import { Request, Response } from 'express'
import config from '../config/config'
import { EApplicationEnvironment } from '../constant/application'
import { THttpResponse } from '../types/types'

export default (req: Request, res: Response, resStatusCode: number, resMessage: string, data: unknown = null): void => {
  const response: THttpResponse = {
    success: true,
    statusCode: resStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl
    },
    message: resMessage,
    data: data
  }

  // eslint-disable-next-line no-console
  console.info('Controller response', { meta: response })

  if (config.ENV === EApplicationEnvironment.PRODUCTION) {
    delete response.request.ip
  }

  res.status(resStatusCode).json(response)
}
