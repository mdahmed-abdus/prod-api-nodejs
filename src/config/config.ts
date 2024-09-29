import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

export default {
  // Server
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SERVER_URL: process.env.SERVER_URL,

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Email
  EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,

  // Client
  CLIENT_URL: process.env.CLIENT_URL
}
