import { NextFunction, Request } from 'express'
import errorObject from '../error/errorObject'

export default (
  nextFunc: NextFunction,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  error: Error | unknown,
  req: Request,
  errorStatusCode: number = 500
): void => {
  const errorObj = errorObject(error, req, errorStatusCode)
  return nextFunc(errorObj)
}
