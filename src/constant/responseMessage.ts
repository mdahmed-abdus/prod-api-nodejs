export default {
  SUCCESS: 'Successful operation',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  NOT_FOUND: (entity: string) => `${entity} not found`,
  TOO_MANY_REQUESTS: 'Too many requests, try again after sometime',
  INVALID_PHONE_NUMBER: 'Invalid phone number',
  ALREADY_EXISTS: (entity: string, identifier: string) => `${entity} already exists with ${identifier}`
}
