import bcrypt from 'bcrypt'
import { getTimezonesForCountry } from 'countries-and-timezones'
import { randomInt } from 'crypto'
import dayjs from 'dayjs'
import jwt from 'jsonwebtoken'
import { parsePhoneNumber } from 'libphonenumber-js'
import os from 'os'
import { v4 } from 'uuid'
import config from '../config'

export default {
  getDomainFromUrl: (url: string) => {
    try {
      return new URL(url).hostname
    } catch (error) {
      throw error
    }
  },
  getSystemHealth: () => ({
    cpuUsage: os.loadavg(),
    totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
    freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`
  }),
  getApplicationHealth: () => ({
    environment: config.ENV,
    upTime: `${process.uptime().toFixed(2)} seconds`,
    memoryUsage: {
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(
        2
      )} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
        2
      )} MB`
    }
  }),
  parsePhoneNumber: (phoneNumber: string) => {
    try {
      const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
      if (parsedPhoneNumber) {
        return {
          countryCode: parsedPhoneNumber.countryCallingCode,
          isoCode: parsedPhoneNumber.country || null,
          internationalNumber: parsedPhoneNumber.formatInternational()
        }
      }

      return {
        countryCode: null,
        isoCode: null,
        internationalNumber: null
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return {
        countryCode: null,
        isoCode: null,
        internationalNumber: null
      }
    }
  },
  countryTimezone: (isoCode: string) => getTimezonesForCountry(isoCode),
  hashPassword: (password: string) =>
    bcrypt.hash(password, config.HASH_SALT_ROUNDS),
  comparePassword: (password: string, hashedPassword: string) =>
    bcrypt.compare(password, hashedPassword),
  generateRandomId: v4,
  generateOtp: (length: number) => {
    const min = Math.pow(10, length - 1)
    const max = Math.pow(10, length) - 1
    return randomInt(min, max).toString()
  },
  generateToken: (payload: object, secret: string, expiry: number) =>
    jwt.sign(payload, secret, { expiresIn: expiry }),
  verifyToken: (token: string, secret: string) => jwt.verify(token, secret),
  generatePasswordResetExpiry: (minutes: number) =>
    dayjs().valueOf() + minutes * 60 * 1000
}
