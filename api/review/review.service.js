import log from 'cros/common/logger.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import { loggerService } from '../../services/logger.service.js'

export const reviewService = {
  query,
  add,
  remove,
}

async function query(filterBy) {
  try {
    const filter = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('review')
    var reviews = await collection.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            localField: 'toyId',
            from: 'toy',
            foreignField: '_id',
            as: 'toy',
          },
        },
        {
          $unwind: '$toy',
        },
        {
          $lookup: {
            localField: 'userId',
            from: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            txt: true,
            'toy._id': true,
            'toy.name': true,
            'toy.price': true,
            'user.fullname': true,
            'user._id': true,
          },
        },
      ])
      .toArray()
    return reviews
  } catch (error) {
    loggerService.error(`cannot remove review ${reviewId}`, err)
    throw error
  }
}

async function add(review) {
  try {
    const reviewToAdd = {
      txt: review.txt,
      toyId: ObjectId.createFromHexString(review.toyId),
      userId: ObjectId.createFromHexString(review.userId),
    }
    const collection = await dbService.getCollection('review')
    const newReview = await collection.insertOne(reviewToAdd)
    return newReview
  } catch (error) {
    loggerService.error('cannot add review', err)
    throw err
  }
}
async function remove(reviewId) {
  try {
    const collection = await dbService.getCollection('review')
     const { deletedCount } = await collection.deleteOne({  _id: ObjectId.createFromHexString(reviewId)}) //protection!!!!
    return deletedCount 
  } catch (err) {
    loggerService.error('cannot remove review', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const filter = {}
  if (filterBy.toyId) {
    filter.toyId = ObjectId.createFromHexString(filterBy.toyId)
  }
  if (filterBy.userId) {
    filter.userId = ObjectId.createFromHexString(filterBy.userId)
  }

  if (filterBy.txt) {
    filter.txt = { $regex: filterBy.txt, $options: 'i' }
  }
  return filter
}
