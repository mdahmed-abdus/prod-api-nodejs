import { getEnvVars } from './helper'

export const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = getEnvVars([
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET'
])

export const ACCESS_TOKEN = {
  ACCESS_TOKEN_SECRET,
  EXPIRY: 3600
}

export const REFRESH_TOKEN = {
  REFRESH_TOKEN_SECRET,
  EXPIRY: 3600 * 24 * 365
}
