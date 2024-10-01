import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

import * as app from './app'
import * as cors from './cors'
import * as db from './db'
import * as mail from './mail'
import * as rateLimiter from './rateLimiter'
import * as token from './token'

export default {
  ...app,
  ...db,
  ...token,
  ...mail,
  ...rateLimiter,
  ...cors
}
