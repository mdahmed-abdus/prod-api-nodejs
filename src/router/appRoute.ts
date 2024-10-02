import { Application } from 'express'
import notFoundHandler from '../errors/notFoundHandler'
import router from '../router/apiRouter'

export default (app: Application) => {
  app.use('/api/v1', router)

  app.use(notFoundHandler)
}
