import mongoose from 'mongoose'
import config from '../config'

export default {
  connect: async () => {
    await mongoose.connect(config.DATABASE_URL)
  }
}
