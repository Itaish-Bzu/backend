import log from 'cros/common/logger.js'
import { loggerService } from '../../services/logger.service.js'
import { reviewService } from './review.service.js'

export async function getReview(req, res) {
  try {
    const reviews = await reviewService.query(req.query)
    res.send(reviews)
  } catch (err) {
    loggerService.error('Cannot get reviews', err)
    res.status(400).send({ err: 'Failed to get reviews' })
  }
}

export async function addReview(req, res) {
  var { loggedinUser } = req

  try {
    var review = req.body
    review.userId = loggedinUser._id
    let newReview = await reviewService.add(review)
    newReview.txt =review.txt
    newReview.user = { fullname: loggedinUser.fullname, _id: loggedinUser._id}
    newReview._id = newReview.insertedId

    delete newReview.toyId
    delete newReview.userId
    delete newReview.acknowledged
    delete newReview.insertedId

    res.send(newReview)
  } catch (error) {
    loggerService.error('Failed to add review', error)
    res.status(400).send({ err: 'Failed to add review' })
  }
}

export async function removeReview(req, res) {
  try {  
     const { id: reviewId} = req.params      
    await reviewService.remove(reviewId)
    res.send()
  } catch (err) {
    loggerService.error('Failed to remove review', err)
    res.status(400).send({ err: 'Failed to remove review' })
  }
}
