import { EUserRole } from '../constant/userConstant'

export interface IUser {
  name: string
  email: string
  phoneNumber: {
    isoCode: string
    countryCode: string
    internationalNumber: string
  }
  timezone: string
  password: string
  role: EUserRole
  accountConfirmation: {
    status: boolean
    token: string
    code: string
    timestamp: Date | null
  }
  passwordReset: {
    token: string | null
    expiry: number | null
    lastResetAt: Date | null
  }
  lastLoginAt: Date | null
  consent: boolean
}

export interface IUserWithId extends IUser {
  _id: string
}

export interface IRegisterRequestBody {
  name: string
  email: string
  phoneNumber: string
  password: string
  consent: boolean
}

export interface ILoginRequestBody {
  email: string
  password: string
}
