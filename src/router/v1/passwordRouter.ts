import { Router } from 'express'
import {
  changePassword,
  forgotPassword,
  resetPassword
} from '../../controller/v1/passwordController'
import auth from '../../middleware/auth'
import rateLimit from '../../middleware/rateLimit'

const router = Router()

// PUT
// base_url/api/v1/password/change
router.route('/change').put(auth, changePassword)

// PUT
// base_url/api/v1/password/forgot
router.route('/forgot').put(rateLimit, forgotPassword)

// PUT
// base_url/api/v1/password/rest/:token
router.route('/reset/:token').put(rateLimit, resetPassword)

export default router
