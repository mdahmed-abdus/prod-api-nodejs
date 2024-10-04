export default {
  SUCCESS: 'Successful operation',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  NOT_FOUND: (entity: string) => `${entity} not found`,
  ALREADY_EXISTS: (entity: string, identifier: string) =>
    `${entity} already exists with ${identifier}`,
  UNAUTHORIZED: 'You are not authorized to perform this action',
  TOO_MANY_REQUESTS: 'Too many requests, try again after sometime',

  EXPIRED_URL: 'URL link has expired',

  ACCOUNT_ALREADY_CONFIRMED: 'Account already confirmed',
  ACCOUNT_CONFIRMATION_REQUIRED: 'Account confirmation required',

  INVALID_REQUEST: 'Invalid request',
  INVALID_PHONE_NUMBER: 'Invalid phone number',
  INVALID_CONFIRMATION_TOKEN_OR_CODE: 'Invalid confirmation token or code',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  INVALID_OLD_PASSWORD: 'Invalid old password',

  PASSWORD_MATCHING_OLD_PASSWORD:
    'New password cannot be the same as old password'
}
