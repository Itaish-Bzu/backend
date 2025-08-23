import express from 'express'

import { addReview, getReview, removeReview } from './review.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'

export const reviewRoutes = express.Router()



reviewRoutes.get('/', getReview)
reviewRoutes.post('/',requireAuth, addReview)
reviewRoutes.delete('/:id',requireAuth, removeReview)
