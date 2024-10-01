import { Router } from 'express'
import apiController from '../controller/apiController'
import auth from '../middleware/auth'
import rateLimit from '../middleware/rateLimit'

const router = Router()

// Rate limit for all routes
// router.use(rateLimit)

// Rate limit for specific route
// router.route('/self').get(rateLimit, apiController.self)

router.route('/self').get(rateLimit, apiController.self)
router.route('/self-identification').get(auth, apiController.selfIdentification)
router.route('/health').get(rateLimit, apiController.health)

router.route('/register').post(rateLimit, apiController.register)
router.route('/confirmation/:token').put(rateLimit, apiController.confirmation)
router.route('/login').post(rateLimit, apiController.login)
router.route('/logout').put(auth, apiController.logout)

router.route('/refresh-token').post(rateLimit, apiController.refreshToken)

router.route('/forgot-password').put(rateLimit, apiController.forgotPassword)
router.route('/reset-password/:token').put(rateLimit, apiController.resetPassword)
router.route('/change-password').put(auth, apiController.changePassword)

export default router
