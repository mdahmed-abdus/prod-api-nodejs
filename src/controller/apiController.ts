import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextFunction, Request, Response } from 'express'
import config from '../config/config'
import { EApplicationEnvironment } from '../constant/application'
import responseMessage from '../constant/responseMessage'
import { EUserRole } from '../constant/userConstant'
import dbService from '../service/dbService'
import emailService from '../service/emailService'
import { validateJoiSchema, validateLoginBody, validateRegisterBody } from '../service/validationService'
import { ILoginRequestBody, IRefreshToken, IRegisterRequestBody, IUser } from '../types/userTypes'
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

interface ILoginRequest extends Request {
  body: ILoginRequestBody
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
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req as ILoginRequest

      const { value, error } = validateJoiSchema<ILoginRequestBody>(validateLoginBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const { email, password } = value

      const user = await dbService.findUserByEmail(email, '+password')
      if (!user) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404)
      }

      const isValidPassword = await quicker.comparePassword(password, user.password)
      if (!isValidPassword) {
        return httpError(next, new Error(responseMessage.INVALID_EMAIL_OR_PASSWORD), req, 400)
      }

      const accessToken = quicker.generateToken(
        { userId: user._id, userRole: user.role },
        config.ACCESS_TOKEN.ACCESS_TOKEN_SECRET as string,
        config.ACCESS_TOKEN.EXPIRY
      )

      const refreshToken = quicker.generateToken(
        { userId: user._id, userRole: user.role },
        config.REFRESH_TOKEN.REFRESH_TOKEN_SECRET as string,
        config.REFRESH_TOKEN.EXPIRY
      )

      const refreshTokenPayload: IRefreshToken = { token: refreshToken }

      await dbService.createRefreshToken(refreshTokenPayload)

      user.lastLoginAt = dayjs().utc().toDate()
      await user.save()

      let domain = ''
      try {
        const url = new URL(config.SERVER_URL as string)
        domain = url.hostname
      } catch (error) {
        throw error
      }

      res
        .cookie('accessToken', accessToken, {
          path: '/api/v1',
          domain,
          sameSite: 'strict',
          maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
          httpOnly: true,
          secure: config.ENV === EApplicationEnvironment.PRODUCTION
        })
        .cookie('refreshToken', refreshToken, {
          path: '/api/v1',
          domain,
          sameSite: 'strict',
          maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
          httpOnly: true,
          secure: config.ENV === EApplicationEnvironment.PRODUCTION
        })

      httpResponse(req, res, 200, responseMessage.SUCCESS, { accessToken, refreshToken })
    } catch (error) {
      httpError(next, error, req, 500)
    }
  }
}
