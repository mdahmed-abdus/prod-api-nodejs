import { connection } from 'mongoose'
import app from './app'
import config from './config'
import dbService from './service/dbService'
import { initRateLimiter } from './service/rateLimiterService'
import logger from './utils/logger'

const server = app.listen(config.PORT, () => {
  logger.info('Server started.', {
    meta: {
      ENV: config.ENV,
      PORT: config.APP_PORT,
      APP_URL: config.APP_URL
    }
  })
})

// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async () => {
  try {
    await dbService.connect()
    logger.info('Database connected.', {
      meta: { connectionName: connection.name }
    })

    initRateLimiter(connection)
    logger.info('Rate limiter initiated.')
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
