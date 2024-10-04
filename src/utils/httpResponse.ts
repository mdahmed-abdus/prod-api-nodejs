import { Request, Response } from 'express'
import config from '../config'
import { THttpResponse } from '../types/httpTypes'
import logger from './logger'

export default (
  req: Request,
  res: Response,
  resStatusCode: number,
  resMessage: string,
  data: unknown = null
): void => {
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

  logger.info('Controller response', { meta: response })

  if (config.IN_PROD) {
    delete response.request.ip
  }

  res.status(resStatusCode).json(response)
}
