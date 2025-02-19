import express from 'express'
import appError from './error/appError'
import appMiddleware from './middleware/appMiddleware'
import appRoute from './router/appRoute'

const app = express()

appMiddleware(app)
appRoute(app)
appError(app)

export default app
