import joi from 'joi'
import {
  IChangePasswordRequestBody,
  IForgotPasswordRequestBody,
  ILoginRequestBody,
  IRegisterRequestBody,
  IResetPasswordRequestBody
} from '../types/userTypes'

export const validateRegisterBody = joi.object<IRegisterRequestBody, true>({
  name: joi.string().trim().min(3).max(72).required(),
  email: joi.string().email().required(),
  phoneNumber: joi.string().min(4).max(20).required(),
  password: joi.string().trim().min(3).max(24).required(),
  consent: joi.boolean().valid(true).required()
})

export const validateLoginBody = joi.object<ILoginRequestBody, true>({
  email: joi.string().email().required(),
  password: joi.string().trim().min(3).max(24).required()
})

export const validateForgotPasswordBody = joi.object<IForgotPasswordRequestBody, true>({
  email: joi.string().email().required()
})

export const validateResetPasswordBody = joi.object<IResetPasswordRequestBody, true>({
  newPassword: joi.string().trim().min(3).max(24).required()
})

export const validateChangePasswordBody = joi.object<IChangePasswordRequestBody, true>({
  oldPassword: joi.string().trim().min(3).max(24).required(),
  newPassword: joi.string().trim().min(3).max(24).required(),
  confirmNewPassword: joi.string().trim().min(3).max(24).required().valid(joi.ref('newPassword'))
})

export const validateJoiSchema = <T>(schema: joi.Schema, value: unknown) => {
  const result = schema.validate(value)
  return {
    value: result.value as T,
    error: result.error
  }
}
