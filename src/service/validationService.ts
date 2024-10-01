import joi from 'joi'
import { IForgotPasswordRequestBody, ILoginRequestBody, IRegisterRequestBody } from '../types/userTypes'

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

export const validateJoiSchema = <T>(schema: joi.Schema, value: unknown) => {
  const result = schema.validate(value)
  return {
    value: result.value as T,
    error: result.error
  }
}
