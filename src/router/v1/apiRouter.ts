import { Router } from 'express'
import { health, identify, self } from '../../controller/v1/apiController'
import auth from '../../middleware/auth'
import rateLimit from '../../middleware/rateLimit'
import passwordRouter from './passwordRouter'
import userRouter from './userRouter'

const router = Router()

// base_url/api/v1/...
router.route('/self').get(rateLimit, self)
router.route('/identify').get(auth, identify)
router.route('/health').get(rateLimit, health)

// base_url/api/v1/users/...
router.use('/users', userRouter)

// base_url/api/v1/password/...
router.use('/password', passwordRouter)

export default router
