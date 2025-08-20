import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

// import { toyService } from './services/toy.service.js'


const app = express()
app.use(cookieParser())

const corsOptions = {
  origin: [
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(express.json())
app.set('query parser', 'extended')


import { toyRoutes } from './api/toy/toy.routers.js'
import { userRoutes } from './api/user/user.routes.js'
import {authRoutes }from './api/auth/auth.routes.js'
import { reviewRoutes } from './api/review/review.routers.js'

 
app.use('/api/toy', toyRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/review', reviewRoutes)



// Fallback route
app.get('/*all', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT|| 3030
app.listen(port, () => console.log(`Server ready at http://127.0.0.1:${port}/`))
