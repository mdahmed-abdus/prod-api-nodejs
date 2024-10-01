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

export default router
