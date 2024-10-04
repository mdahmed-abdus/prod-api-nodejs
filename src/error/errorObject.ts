import { Request } from 'express'
import config from '../config'
import responseMessage from '../constant/responseMessage'
import { THttpError } from '../types/httpTypes'
import logger from '../utils/logger'

export default (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  error: Error | unknown,
  req: Request,
  errorStatusCode: number = 500
): THttpError => {
  const errorObj: THttpError = {
    success: false,
    statusCode: errorStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl
    },
    message:
      error instanceof Error
        ? error.message || responseMessage.SOMETHING_WENT_WRONG
        : responseMessage.SOMETHING_WENT_WRONG,
    data: null,
    trace: error instanceof Error ? { error: error.stack } : null
  }

  logger.info('Controller error', { meta: errorObj })

  if (config.IN_PROD) {
    delete errorObj.request.ip
    delete errorObj.trace
  }

  return errorObj
}
