import { Router } from 'express'
import apiController from '../controller/apiController'
import auth from '../middleware/auth'

const router = Router()

// Rate limit for all routes
// router.use(rateLimit)

// Rate limit for specific route
// router.route('/self').get(rateLimit, apiController.self)

router.route('/self').get(apiController.self)
router.route('/self-identification').get(auth, apiController.selfIdentification)
router.route('/health').get(apiController.health)

router.route('/register').post(apiController.register)
router.route('/confirmation/:token').put(apiController.confirmation)
router.route('/login').post(apiController.login)
router.route('/logout').put(auth, apiController.logout)

router.route('/refresh-token').post(apiController.refreshToken)

router.route('/forgot-password').put(apiController.forgotPassword)
router.route('/reset-password/:token').put(apiController.resetPassword)
router.route('/change-password').put(auth, apiController.changePassword)

export default router
