import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import path from 'path'
import config from './config'
import responseMessage from './constant/responseMessage'
import globalErrorHandler from './middleware/globalErrorHandler'
import router from './router/apiRouter'
import httpError from './utils/httpError'

const app: Application = express()

// Middleware
app.use(helmet())

app.use(cookieParser())
app.use(cors(config.CORS_OPTIONS))
app.use(express.json())
app.use(express.static(path.join(__dirname, '../', 'public')))

// Routes
app.use('/api/v1', router)

// 404 handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  try {
    throw new Error(responseMessage.NOT_FOUND('route'))
  } catch (error) {
    httpError(next, error, req, 404)
  }
})

// Error
app.use(globalErrorHandler)

export default app
