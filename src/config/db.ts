import { getEnvVars } from './helper'

export const { DATABASE_URL } = getEnvVars(['DATABASE_URL'])
