import { error } from 'console'
import app from './app'
import config from './config/config'

const server = app.listen(config.PORT)

;(() => {
  try {
    // TODO: database connection
    // eslint-disable-next-line no-console
    console.info('Server is running...', { meta: { PORT: config.PORT, SERVER_URL: config.SERVER_URL } })
  } catch {
    // eslint-disable-next-line no-console
    console.error('Server error. Server is not running.', { meta: error })
    server.close((error) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Server error. Server could not be closed.', { meta: error })
      }
      process.exit(1)
    })
  }
})()
