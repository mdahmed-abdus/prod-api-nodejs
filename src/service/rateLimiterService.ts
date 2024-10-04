import { Connection } from 'mongoose'
import { RateLimiterMongo } from 'rate-limiter-flexible'
import config from '../config'

export let rateLimiterMongo: null | RateLimiterMongo = null

export const initRateLimiter = (mongooseConn: Connection) => {
  rateLimiterMongo = new RateLimiterMongo({
    storeClient: mongooseConn,
    points: config.RATE_LIMIT_POINTS,
    duration: config.RATE_LIMIT_DURATION
  })
}
