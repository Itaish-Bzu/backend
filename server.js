import express from 'express'
import cors from 'cors'
import path from 'path'

import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'
const app = express()

const corsOptions = {
  origin: [
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://localhost:5173',
  ],
  credentials: true,
}

app.use(cors(corsOptions))
// app.use(express.static('public'))
app.use(express.json())
app.set('query parser', 'extended')

app.get('/api/toy', (req, res) => {
  const filterBy = {
    txt: req.query.txt || '',
    inStock: req.query.inStock || '',
    labels: req.query.labels || '',
    sort: req.query.sort || '',
  }
  toyService
    .query(filterBy)
    .then((result) => res.send(result))
    .catch((err) => {
      loggerService.error('Cannot get toys', err)
      res.status(400).send('Cannot get toys')
    })
})

app.put('/api/toy/:toyId', (req, res) => {
  const toyToSave = {
    _id: req.params.toyId,
    name: req.body.name,
    price: +req.body.price,
    labels: req.body.labels,
    inStock: req.body.inStock,
  }
  console.log(toyToSave)

  toyService
    .save(toyToSave)
    .then((savedToy) => res.send(savedToy))
    .catch((err) => {
      loggerService.error('Cannot save toy', err)
      res.status(400).send('Cannot save toy')
    })
})

app.post('/api/toy', (req, res) => {
  const toyToSave = {
    name: req.body.name,
    price: +req.body.price,
    labels: req.body.labels,
    inStock: req.body.inStock,
  }

  toyService
    .save(toyToSave)
    .then((savedToy) => res.send(savedToy))
    .catch((err) => {
      loggerService.error('Cannot save toy', err)
      res.status(400).send('Cannot save toy')
    })
})

app.get('/api/toy/:toyId', (req, res) => {
  const { toyId } = req.params
  toyService
    .getById(toyId)
    .then((toy) => {
      res.send(toy)
    })
    .catch((err) => {
      loggerService.error('Cannot get toy', err)
      res.status(400).send('Cannot load toy')
    })
})

app.delete('/api/toy/:toyId', (req, res) => {
  const { toyId } = req.params
  toyService
    .remove(toyId)
    .then(() => res.send('toy removed!'))
    .catch((err) => {
      loggerService.error('Cannot remove toy', err)
      res.status(400).send('Cannot remove toy')
    })
})

// Fallback route
app.get('/*all', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => console.log(`Server ready at http://127.0.0.1:${port}/`))
