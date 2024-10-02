import { Application, NextFunction, Request, Response } from 'express'
import { THttpError } from '../types/types'

export default (app: Application) => {
  app.use(
    (
      error: THttpError,
      _req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: NextFunction
    ): void => {
      res.status(error.statusCode).json(error)
    }
  )
}
