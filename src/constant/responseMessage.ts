export default {
  SUCCESS: 'Successful operation',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  NOT_FOUND: (entity: string) => `${entity} not found`,
  TOO_MANY_REQUESTS: 'Too many requests, try again after sometime',
  INVALID_PHONE_NUMBER: 'Invalid phone number',
  ALREADY_EXISTS: (entity: string, identifier: string) => `${entity} already exists with ${identifier}`,
  INVALID_CONFIRMATION_TOKEN_OR_CODE: 'Invalid confirmation token or code',
  ACCOUNT_ALREADY_CONFIRMED: 'Account already confirmed',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  ACCOUNT_CONFIRMATION_REQUIRED: 'Account confirmation required',
  EXPIRED_URL: 'URL link has expired',
  INVALID_REQUEST: 'Invalid request'
}
