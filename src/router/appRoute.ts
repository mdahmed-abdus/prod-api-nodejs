import { Application } from 'express'
import notFoundHandler from '../error/notFoundHandler'
import apiRouterV1 from './v1/apiRouter'

export default (app: Application) => {
  // base_url/api/v1/...
  app.use('/api/v1', apiRouterV1)

  app.use(notFoundHandler)
}
