import { NextFunction, Request, Response } from 'express'
import httpError from '../utils/httpError'

export default (
    handler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      httpError(next, error, req, 500)
    }
  }
