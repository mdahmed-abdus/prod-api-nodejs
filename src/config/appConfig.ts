import { EApplicationEnvironment } from '../constant/application'
import { getEnvVars } from './helper'

export const {
  ENV,
  APP_PORT: PORT,
  APP_HOSTNAME,
  FRONTEND_URL
} = getEnvVars(['ENV', 'APP_PORT', 'APP_HOSTNAME', 'FRONTEND_URL'])

export const APP_PORT = +PORT

export const IN_PROD = ENV === (EApplicationEnvironment.PRODUCTION as string)
export const IN_DEV = ENV === (EApplicationEnvironment.DEVELOPMENT as string)
export const IN_TEST = ENV === (EApplicationEnvironment.TEST as string)

export const APP_PROTOCOL = IN_PROD ? 'https' : 'http'
export const APP_URL = `${APP_PROTOCOL}://${APP_HOSTNAME}:${APP_PORT}`
