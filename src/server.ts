import { connection } from 'mongoose'
import app from './app'
import config from './config'
import { initRateLimiter } from './config/rateLimiter'
import dbService from './service/dbService'
import logger from './utils/logger'

const server = app.listen(config.PORT)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async () => {
  try {
    const conn = await dbService.connect()
    logger.info('Database connected.', { meta: { connectionName: conn.name } })

    initRateLimiter(connection)
    logger.info('Rate limiter initiated.')

    logger.info('Server started.', {
      meta: {
        ENV: config.ENV,
        PORT: config.APP_PORT,
        APP_URL: config.APP_URL
      }
    })
  } catch (error) {
    logger.error('Server error. Server stopped.', { meta: error })
    server.close((error) => {
      if (error) {
        logger.error('Server error. Server could not be closed.', {
          meta: error
        })
      }
      process.exit(1)
    })
  }
})()
