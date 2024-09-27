import { Router } from 'express'
import apiController from '../controller/apiController'

const router = Router()

// Rate limit for all routes
// router.use(rateLimit)

// Rate limit for specific route
// router.route('/self').get(rateLimit, apiController.self)

router.route('/self').get(apiController.self)
router.route('/health').get(apiController.health)

export default router
