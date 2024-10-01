import { error } from 'console'
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
    logger.info('Database connection', { meta: { connectionName: conn.name } })

    initRateLimiter(connection)
    logger.info('Rate limiter initiated')

    logger.info('Server is running...', {
      meta: { PORT: config.APP_PORT, SERVER_URL: config.APP_URL }
    })
  } catch {
    logger.error('Server error. Server is not running.', { meta: error })
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
