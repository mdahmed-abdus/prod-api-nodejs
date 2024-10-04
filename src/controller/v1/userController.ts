import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextFunction, Request, Response } from 'express'
import config from '../../config'
import responseMessage from '../../constant/responseMessage'
import { EUserRole } from '../../constant/userConstant'
import refreshTokenDao from '../../dataAccess/refreshTokenDao'
import userDao from '../../dataAccess/userDao'
import catchAsyncError from '../../errors/catchAsyncError'
import cryptoService from '../../service/cryptoService'
import emailService from '../../service/emailService'
import tokenService from '../../service/tokenService'
import {
  validateJoiSchema,
  validateLoginBody,
  validateRegisterBody
} from '../../service/validationService'
import { IDecryptedJwt, IRefreshToken } from '../../types/tokenTypes'
import {
  ILoginRequestBody,
  IRegisterRequestBody,
  IUser
} from '../../types/userTypes'
import utils from '../../utils'
import httpError from '../../utils/httpError'
import httpResponse from '../../utils/httpResponse'
import logger from '../../utils/logger'

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

export const register = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req as IRegisterRequest

    const { value, error } = validateJoiSchema<IRegisterRequestBody>(
      validateRegisterBody,
      body
    )
    if (error) {
      return httpError(next, error, req, 422)
    }

    const { name, phoneNumber, email, password, consent } = value
    const { countryCode, internationalNumber, isoCode } =
      utils.parsePhoneNumber('+' + phoneNumber)

    if (!countryCode || !internationalNumber || !isoCode) {
      return httpError(
        next,
        new Error(responseMessage.INVALID_PHONE_NUMBER),
        req,
        422
      )
    }

    const timezone = utils.countryTimezone(isoCode)
    if (!timezone || timezone.length === 0) {
      return httpError(
        next,
        new Error(responseMessage.INVALID_PHONE_NUMBER),
        req,
        422
      )
    }

    const user = await userDao.findUserByEmail(email)
    if (user) {
      return httpError(
        next,
        new Error(responseMessage.ALREADY_EXISTS('user', email)),
        req,
        422
      )
    }

    const hashedPassword = await cryptoService.hashPassword(password)

    const token = utils.generateRandomId()
    const code = utils.generateOtp(6)

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

    const newUser = await userDao.registerUser(payload)

    const confirmationUrl = `${config.FRONTEND_URL}/confirmation/${token}?code=${code}`
    const to = [email]
    const subject = 'Confirm your account'
    const text = `Please confirm your account by clicking on the link below\n\n${confirmationUrl}`

    emailService.sendMail(to, subject, text).catch((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      logger.error('Email service', { meta: error })
    })

    httpResponse(req, res, 201, responseMessage.SUCCESS, { _id: newUser._id })
  }
)

export const login = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req as ILoginRequest

    const { value, error } = validateJoiSchema<ILoginRequestBody>(
      validateLoginBody,
      body
    )
    if (error) {
      return httpError(next, error, req, 422)
    }

    const { email, password } = value

    const user = await userDao.findUserByEmail(email, '+password')
    if (!user) {
      return httpError(
        next,
        new Error(responseMessage.NOT_FOUND('user')),
        req,
        404
      )
    }

    const isValidPassword = await cryptoService.comparePassword(
      password,
      user.password
    )
    if (!isValidPassword) {
      return httpError(
        next,
        new Error(responseMessage.INVALID_EMAIL_OR_PASSWORD),
        req,
        400
      )
    }

    const accessToken = tokenService.generateToken(
      { userId: user._id, userRole: user.role },
      config.ACCESS_TOKEN.ACCESS_TOKEN_SECRET,
      config.ACCESS_TOKEN.EXPIRY
    )

    const refreshToken = tokenService.generateToken(
      { userId: user._id, userRole: user.role },
      config.REFRESH_TOKEN.REFRESH_TOKEN_SECRET,
      config.REFRESH_TOKEN.EXPIRY
    )

    const refreshTokenPayload: IRefreshToken = { token: refreshToken }

    await refreshTokenDao.createRefreshToken(refreshTokenPayload)

    user.lastLoginAt = dayjs().utc().toDate()
    await user.save()

    const domain = config.APP_HOSTNAME

    res
      .cookie('accessToken', accessToken, {
        path: '/api/v1',
        domain,
        sameSite: 'strict',
        maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
        httpOnly: true,
        secure: config.IN_PROD
      })
      .cookie('refreshToken', refreshToken, {
        path: '/api/v1',
        domain,
        sameSite: 'strict',
        maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
        httpOnly: true,
        secure: config.IN_PROD
      })

    httpResponse(req, res, 200, responseMessage.SUCCESS, {
      accessToken,
      refreshToken
    })
  }
)

export const logout = catchAsyncError(async (req: Request, res: Response) => {
  const { cookies } = req
  const { refreshToken } = cookies as { refreshToken: string | null }

  if (refreshToken) {
    await refreshTokenDao.deleteRefreshToken(refreshToken)
  }

  const domain = config.APP_HOSTNAME

  res
    .clearCookie('accessToken', {
      path: '/api/v1',
      domain,
      sameSite: 'strict',
      maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
      httpOnly: true,
      secure: config.IN_PROD
    })
    .clearCookie('refreshToken', {
      path: '/api/v1',
      domain,
      sameSite: 'strict',
      maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
      httpOnly: true,
      secure: config.IN_PROD
    })

  httpResponse(req, res, 200, responseMessage.SUCCESS)
})

export const confirmation = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { params, query } = req as IConfirmRequest
    const { token } = params
    const { code } = query

    const user = await userDao.findUserByConfirmationTokenAndCode(token, code)
    if (!user) {
      return httpError(
        next,
        new Error(responseMessage.INVALID_CONFIRMATION_TOKEN_OR_CODE),
        req,
        400
      )
    }

    if (user.accountConfirmation.status) {
      return httpError(
        next,
        new Error(responseMessage.ACCOUNT_ALREADY_CONFIRMED),
        req,
        400
      )
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
  }
)

export const refreshToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cookies } = req
    const { refreshToken, accessToken } = cookies as {
      refreshToken: string | null
      accessToken: string | null
    }

    if (accessToken) {
      try {
        const verifiedAccessToken = tokenService.verifyToken(
          accessToken,
          config.ACCESS_TOKEN.ACCESS_TOKEN_SECRET
        ) as IDecryptedJwt

        if (verifiedAccessToken) {
          return httpResponse(req, res, 304, responseMessage.SUCCESS)
        }
      } catch {
        return httpError(
          next,
          new Error(responseMessage.UNAUTHORIZED),
          req,
          401
        )
      }
    }

    if (!refreshToken) {
      return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
    }

    const rft = await refreshTokenDao.getRefreshToken(refreshToken)
    if (!rft) {
      return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
    }

    const domain = config.APP_HOSTNAME

    try {
      const { userId, userRole } = tokenService.verifyToken(
        refreshToken,
        config.REFRESH_TOKEN.REFRESH_TOKEN_SECRET
      ) as IDecryptedJwt

      const newAccessToken = tokenService.generateToken(
        { userId, userRole },
        config.ACCESS_TOKEN.ACCESS_TOKEN_SECRET,
        config.ACCESS_TOKEN.EXPIRY
      )

      res.cookie('accessToken', newAccessToken, {
        path: '/api/v1',
        domain,
        sameSite: 'strict',
        maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
        httpOnly: true,
        secure: config.IN_PROD
      })

      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch {
      return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
    }
  }
)
