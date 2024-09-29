import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextFunction, Request, Response } from 'express'
import config from '../config/config'
import responseMessage from '../constant/responseMessage'
import { EUserRole } from '../constant/userConstant'
import dbService from '../service/dbService'
import emailService from '../service/emailService'
import { validateJoiSchema, validateRegisterBody } from '../service/validationService'
import { IRegisterRequestBody, IUser } from '../types/userTypes'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'
import logger from '../utils/logger'
import quicker from '../utils/quicker'

dayjs.extend(utc)

interface IRegisterRequest extends Request {
  body: IRegisterRequestBody
}

interface IConfirmRequest extends Request {
  params: {
    token: string
  }
  query: {
    code: string
  }
}

export default {
  self: (req: Request, res: Response, next: NextFunction) => {
    try {
      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch (error) {
      httpError(next, error, req, 500)
    }
  },
  health: (req: Request, res: Response, next: NextFunction) => {
    try {
      const healthData = {
        application: quicker.getApplicationHealth(),
        system: quicker.getSystemHealth(),
        timeStamp: Date.now()
      }
      httpResponse(req, res, 200, responseMessage.SUCCESS, healthData)
    } catch (error) {
      httpError(next, error, req, 500)
    }
  },
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req as IRegisterRequest

      const { value, error } = validateJoiSchema<IRegisterRequestBody>(validateRegisterBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const { name, phoneNumber, email, password, consent } = value
      const { countryCode, internationalNumber, isoCode } = quicker.parsePhoneNumber('+' + phoneNumber)

      if (!countryCode || !internationalNumber || !isoCode) {
        return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422)
      }

      const timezone = quicker.countryTimezone(isoCode)
      if (!timezone || timezone.length === 0) {
        return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422)
      }

      const user = await dbService.findUserByEmail(email)
      if (user) {
        return httpError(next, new Error(responseMessage.ALREADY_EXISTS('user', email)), req, 422)
      }

      const hashedPassword = await quicker.hashPassword(password)

      const token = quicker.generateRandomId()
      const code = quicker.generateOtp(6)

      const payload: IUser = {
        name,
        email,
        phoneNumber: { countryCode, isoCode, internationalNumber },
        password: hashedPassword,
        accountConfirmation: { status: false, token, code, timestamp: null },
        passwordReset: { token: null, expiry: null, lastResetAt: null },
        lastLoginAt: null,
        role: EUserRole.USER,
        timezone: timezone[0].name,
        consent
      }

      const newUser = await dbService.registerUser(payload)

      const confirmationUrl = `${config.FRONTEND_URL}/confirmation/${token}?code=${code}`
      const to = [email]
      const subject = 'Confirm your account'
      const text = `Please confirm your account by clicking on the link below\n\n${confirmationUrl}`

      emailService.sendMail(to, subject, text).catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        logger.error('Email service', { meta: error })
      })

      httpResponse(req, res, 201, responseMessage.SUCCESS, { _id: newUser._id })
    } catch (error) {
      httpError(next, error, req, 500)
    }
  },
  confirmation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, query } = req as IConfirmRequest
      const { token } = params
      const { code } = query

      const user = await dbService.findUserByConfirmationTokenAndCode(token, code)
      if (!user) {
        return httpError(next, new Error(responseMessage.INVALID_CONFIRMATION_TOKEN_OR_CODE), req, 400)
      }

      if (user.accountConfirmation.status) {
        return httpError(next, new Error(responseMessage.ACCOUNT_ALREADY_CONFIRMED), req, 400)
      }

      user.accountConfirmation.status = true
      user.accountConfirmation.timestamp = dayjs().utc().toDate()

      await user.save()

      const to = [user.email]
      const subject = 'Account confirmed'
      const text = 'Your account has been confirmed'

      emailService.sendMail(to, subject, text).catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        logger.error('Email service', { meta: error })
      })

      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch (error) {
      httpError(next, error, req, 500)
    }
  }
}
