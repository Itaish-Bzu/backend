import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
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
    newReview.txt = review.txt
    newReview.user = { fullname: loggedinUser.fullname, _id: loggedinUser._id }
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
  const { loggedinUser } = req
  try {
    const { id: reviewId } = req.params
   const msg= await reviewService.remove(reviewId)
console.log('*******', msg);

    if (loggedinUser.isAdmin) {
      socketService.broadcast({
        type: 'admin-change',
        data: `admin remove review`,
        userId: loggedinUser._id,
      })
    }
    res.send('remove review')
  } catch (err) {
    loggerService.error('Failed to remove review', err)
    res.status(400).send({ err: 'Failed to remove review' })
  }
}
