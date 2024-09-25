import { error } from 'console'
import app from './app'
import config from './config/config'
import logger from './utils/logger'

const server = app.listen(config.PORT)

;(() => {
  try {
    // TODO: database connection
    logger.info('Server is running...', { meta: { PORT: config.PORT, SERVER_URL: config.SERVER_URL } })
  } catch {
    logger.error('Server error. Server is not running.', { meta: error })
    server.close((error) => {
      if (error) {
        logger.error('Server error. Server could not be closed.', { meta: error })
      }
      process.exit(1)
    })
  }
})()
