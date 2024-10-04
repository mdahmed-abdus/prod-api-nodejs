import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

import * as appConfig from './appConfig'
import * as cryptoConfig from './cryptoConfig'
import * as dbConfig from './dbConfig'
import * as mailConfig from './mailConfig'
import * as rateLimiterConfig from './rateLimiterConfig'
import * as tokenConfig from './tokenConfig'

export default {
  ...appConfig,
  ...dbConfig,
  ...tokenConfig,
  ...mailConfig,
  ...rateLimiterConfig,
  ...cryptoConfig
}
