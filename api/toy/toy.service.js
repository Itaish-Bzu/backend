import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { reviewService } from '../review/review.service.js'

const PAGE_SIZE = 4

export const toyService = {
  query,
  getById,
  remove,
  add,
  update,
}

async function query(filterBy) {
  const { criteria, sort } = _buildCriteriaFromFilter(filterBy)
  try {
    const collection = await dbService.getCollection('toy')
    const toys = await collection.find(criteria, { sort }).toArray()
    return toys
  } catch (error) {
    loggerService.error('Failed to get toys', err)
    throw err
  }

  // const maxPage = Math.ceil(toysToReturn.length / PAGE_SIZE)
  // if (filterBy.pageIdx !== undefined) {
  //   const startIdx = filterBy.pageIdx * PAGE_SIZE
  //   toysToReturn = toysToReturn.slice(startIdx, startIdx + PAGE_SIZE)
  // }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = await collection.findOne({
      _id: ObjectId.createFromHexString(toyId),
    })

    let reviews = await reviewService.query({ toyId: toyId }) ///
    reviews = reviews.map((review) => {
      delete review.toy
      return review
    })
    toy.reviews = reviews     
    return toy
  } catch (error) {
    loggerService.error('Failed to get toy', error)
    throw error
  }
}

async function add(toy) {
  toy.createAt = Date.now()
  toy.imgUrl = `https://robohash.org/${makeId()}?set=set1"`
  try {
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (err) {
    loggerService.error('cannot insert toy', err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: toy.price,
      labels: toy.labels,
      inStock: toy.inStock,
    }
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toy._id) },
      { $set: toyToSave }
    )
    return toy
  } catch (err) {
    loggerService.error(`cannot update toy ${toy._id}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const { deletedCount } = await collection.deleteOne({
      _id: ObjectId.createFromHexString(toyId),
    })
    return deletedCount
  } catch (err) {
    loggerService.error(`cannot remove toy ${toyId}`, err)
    throw err
  }

  // const toyIdx = toys.findIndex((toy) => toy._id === toyId)
  // if (toyIdx === -1) return Promise.reject('Cannot find toy - ' + toyId)
  // toys.splice(toyIdx, 1)
  // return _saveToysToFile()
}

function _buildCriteriaFromFilter(filterBy) {
  let sort = {}
  const criteria = {}

  if (filterBy.txt) {
    criteria.name = { $regex: filterBy.txt, $options: 'i' }
  }
  if (filterBy.inStock) {
    criteria.inStock = JSON.parse(filterBy.inStock)
  }
  if (filterBy.labels) {
    criteria.labels = { $in: filterBy.labels }
  }
  if (filterBy.sort === 'txt') {
    sort.name = 1
  } else if (filterBy.sort === 'price' || filterBy.sort === 'createdAt') {
    sort[filterBy.sort] = 1
  }

  return { criteria, sort }
}
