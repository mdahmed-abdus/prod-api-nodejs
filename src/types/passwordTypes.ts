export interface IForgotPasswordRequestBody {
  email: string
}

export interface IResetPasswordRequestBody {
  newPassword: string
}

export interface IChangePasswordRequestBody {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}
