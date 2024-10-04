import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextFunction, Request, Response } from 'express'
import config from '../../config'
import responseMessage from '../../constant/responseMessage'
import catchAsyncError from '../../errors/catchAsyncError'
import crypto from '../../service/crypto'
import dbService from '../../service/dbService'
import emailService from '../../service/emailService'
import {
  validateChangePasswordBody,
  validateForgotPasswordBody,
  validateJoiSchema,
  validateResetPasswordBody
} from '../../service/validationService'
import {
  IChangePasswordRequestBody,
  IForgotPasswordRequestBody,
  IResetPasswordRequestBody,
  IUserWithId
} from '../../types/userTypes'
import httpError from '../../utils/httpError'
import httpResponse from '../../utils/httpResponse'
import logger from '../../utils/logger'
import quicker from '../../utils/quicker'

dayjs.extend(utc)

interface IForgotPasswordRequest extends Request {
  body: IForgotPasswordRequestBody
}

interface IResetPasswordRequest extends Request {
  params: { token: string }
  body: IResetPasswordRequestBody
}

interface IChangePasswordRequest extends Request {
  authenticatedUser: IUserWithId
  body: IChangePasswordRequestBody
}

export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req as IForgotPasswordRequest

    const { error, value } = validateJoiSchema<IForgotPasswordRequestBody>(
      validateForgotPasswordBody,
      body
    )
    if (error) {
      return httpError(next, error, req, 422)
    }

    const { email } = value

    const user = await dbService.findUserByEmail(email)
    if (!user) {
      return httpError(
        next,
        new Error(responseMessage.NOT_FOUND('user')),
        req,
        404
      )
    }

    if (!user.accountConfirmation.status) {
      return httpError(
        next,
        new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED),
        req,
        400
      )
    }

    const token = quicker.generateRandomId()
    const expiry = quicker.generatePasswordResetExpiry(10)

    user.passwordReset.token = token
    user.passwordReset.expiry = expiry
    await user.save()

    const passwordResetUrl = `${config.FRONTEND_URL}/reset-password/${token}`
    const to = [email]
    const subject = 'Account password reset requested'
    const text = `Please reset your account password by clicking on the link below\nLink will expire within 15 minutes\n\n${passwordResetUrl}`

    emailService.sendMail(to, subject, text).catch((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      logger.error('Email service', { meta: error })
    })

    httpResponse(req, res, 200, responseMessage.SUCCESS)
  }
)

export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body, params } = req as IResetPasswordRequest
    const { error, value } = validateJoiSchema<IResetPasswordRequestBody>(
      validateResetPasswordBody,
      body
    )
    if (error) {
      return httpError(next, error, req, 422)
    }

    const { token } = params
    const user = await dbService.findUserByResetToken(token)
    if (!user) {
      return httpError(
        next,
        new Error(responseMessage.NOT_FOUND('user')),
        req,
        404
      )
    }

    if (!user.accountConfirmation.status) {
      return httpError(
        next,
        new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED),
        req,
        400
      )
    }

    const storedExpiry = user.passwordReset.expiry
    const currentTimestamp = dayjs().valueOf()

    if (!storedExpiry) {
      return httpError(
        next,
        new Error(responseMessage.INVALID_REQUEST),
        req,
        400
      )
    }

    if (currentTimestamp > storedExpiry) {
      return httpError(next, new Error(responseMessage.EXPIRED_URL), req, 400)
    }

    const { newPassword } = value
    const hashedPassword = await crypto.hashPassword(newPassword)

    user.password = hashedPassword
    user.passwordReset.token = null
    user.passwordReset.expiry = null
    user.passwordReset.lastResetAt = dayjs().utc().toDate()
    await user.save()

    const to = [user.email]
    const subject = 'Reset password successful'
    const text = `Your account password has been reset successfully`

    emailService.sendMail(to, subject, text).catch((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      logger.error('Email service', { meta: error })
    })

    httpResponse(req, res, 200, responseMessage.SUCCESS)
  }
)

export const changePassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body, authenticatedUser } = req as IChangePasswordRequest

    const { error, value } = validateJoiSchema<IChangePasswordRequestBody>(
      validateChangePasswordBody,
      body
    )
    if (error) {
      return httpError(next, error, req, 422)
    }

    const user = await dbService.findUserById(
      authenticatedUser._id,
      '+password'
    )
    if (!user) {
      return httpError(
        next,
        new Error(responseMessage.NOT_FOUND('user')),
        req,
        404
      )
    }

    const { oldPassword, newPassword } = value

    if (newPassword === oldPassword) {
      return httpError(
        next,
        new Error(responseMessage.PASSWORD_MATCHING_OLD_PASSWORD),
        req,
        400
      )
    }

    const isOldPasswordValid = await crypto.comparePassword(
      oldPassword,
      user.password
    )
    if (!isOldPasswordValid) {
      return httpError(
        next,
        new Error(responseMessage.INVALID_OLD_PASSWORD),
        req,
        400
      )
    }

    const hashedNewPassword = await crypto.hashPassword(newPassword)
    user.password = hashedNewPassword
    await user.save()

    const to = [user.email]
    const subject = 'Password changed'
    const text = `Your account password has been changed successfully`

    emailService.sendMail(to, subject, text).catch((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      logger.error('Email service', { meta: error })
    })

    httpResponse(req, res, 200, responseMessage.SUCCESS)
  }
)
