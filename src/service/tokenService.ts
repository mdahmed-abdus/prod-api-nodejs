import jwt from 'jsonwebtoken'

export default {
  generateToken: (payload: object, secret: string, expiry: number) =>
    jwt.sign(payload, secret, { expiresIn: expiry }),

  verifyToken: (token: string, secret: string) => jwt.verify(token, secret)
}
