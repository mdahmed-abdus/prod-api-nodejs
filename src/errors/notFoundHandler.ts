import { NextFunction, Request, Response } from 'express'
import responseMessage from '../constant/responseMessage'
import httpError from '../utils/httpError'

export default (req: Request, _res: Response, next: NextFunction) => {
  httpError(next, new Error(responseMessage.NOT_FOUND('route')), req, 404)
}
