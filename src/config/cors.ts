import { CorsOptions } from 'cors'
import { FRONTEND_URL } from './app'

export const CORS_OPTIONS: CorsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}
