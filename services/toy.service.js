import fs from 'fs'
import { makeId, readJsonFile } from './util.service.js'

const toys = readJsonFile('data/toy.json')
const PAGE_SIZE = 4

export const toyService = {
  query,
  getById,
  remove,
  save,
}

function query(filterBy) {
  let toysToReturn = [...toys]

  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, 'i')
    toysToReturn = toysToReturn.filter((toy) => regExp.test(toy.name))
  }
  if (filterBy.inStock) {
    toysToReturn = toysToReturn.filter(
      (toy) => toy.inStock === JSON.parse(filterBy.inStock)
    )
  }
  if (filterBy.labels) {
    toysToReturn = toysToReturn.filter((toy) =>
      toy.labels.some((label) => filterBy.labels.includes(label))
    )
  }
  if (filterBy.sort) {
    toysToReturn.sort((toy1, toy2) => {
      if (filterBy.sort === 'txt') {
        return toy1.name.localeCompare(toy2.name)
      } else if (filterBy.sort === 'price' || filterBy.sort === 'createAt') {
        return toy1[filterBy.sort] - toy2[filterBy.sort]
      }
    })
  }

  const maxPage = Math.ceil(toysToReturn.length / PAGE_SIZE)
  if (filterBy.pageIdx !== undefined) {
    const startIdx = filterBy.pageIdx * PAGE_SIZE
    toysToReturn = toysToReturn.slice(startIdx, startIdx + PAGE_SIZE)
  }

  return Promise.resolve({toysToReturn,maxPage  })
}

function getById(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)
  if (!toy) return Promise.reject('Cannot find toy - ' + toyId)
  return Promise.resolve(toy)
}

function remove(toyId) {
  const toyIdx = toys.findIndex((toy) => toy._id === toyId)
  if (toyIdx === -1) return Promise.reject('Cannot find toy - ' + toyId)
  toys.splice(toyIdx, 1)
  return _saveToysToFile()
}

function save(toyToSave) {
  if (toyToSave._id) {
    const toyToUpdate = toys.find((currToy) => currToy._id === toyToSave._id)
    if (!toyToUpdate) return Promise.reject('Cannot find toy - ' + toyToSave)
    toyToUpdate.name = toyToSave.name
    toyToUpdate.price = toyToSave.price
    toyToUpdate.labels = toyToSave.labels
    toyToUpdate.inStock = toyToSave.inStock

    toyToSave = toyToUpdate
  } else {
    toyToSave._id = makeId()
    toyToSave.createAt = Date.now()
    toyToSave.imgUrl = `https://robohash.org/${makeId()}?set=set2"`

    toys.unshift(toyToSave)
  }

  return _saveToysToFile().then(() => toyToSave)
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(toys, null, 4)
    fs.writeFile('data/toy.json', data, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}
