import { Router } from 'express'
import {
  confirmation,
  login,
  logout,
  refreshToken,
  register
} from '../../controller/v1/userController'
import auth from '../../middleware/auth'
import rateLimit from '../../middleware/rateLimit'

const router = Router()

// POST
// base_url/api/v1/user/register
router.route('/register').post(rateLimit, register)

// POST
// base_url/api/v1/user/login
router.route('/login').post(rateLimit, login)

// PUT
// // base_url/api/v1/user/logout
router.route('/logout').put(auth, logout)

// PUT
// // base_url/api/v1/user/confirmation/:token
router.route('/confirmation/:token').put(rateLimit, confirmation)

// POST
// // base_url/api/v1/user/refresh-token
router.route('/refresh-token').post(rateLimit, refreshToken)

export default router
