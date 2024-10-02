import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application } from 'express'
import helmet from 'helmet'
import path from 'path'
import config from '../config'

export default (app: Application) => {
  app.use(helmet())

  app.use(cookieParser())
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    })
  )
  app.use(express.json())
  app.use(express.static(path.join(__dirname, '../', 'public')))
}
