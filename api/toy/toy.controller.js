import { toyService } from './toy.service.js'
import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getToys(req, res) {
  try {
    const filterBy = {
      txt: req.query.txt || '',
      inStock: req.query.inStock || '',
      labels: req.query.labels ||'',
      sort: req.query.sort || '',
    //   pageIdx: req.query.pageIdx || undefined,
    }
    const toys = await toyService.query(filterBy)
    res.json(toys)
  } catch (err) {
    loggerService.error('Failed to get toys', err)
    res.status(500).send({ err: 'Failed to get toys' })
  }
}

export async function getToyById(req, res) {
  try {
    const toyId = req.params.id
    const toy = await toyService.getById(toyId)
    res.json(toy)
  } catch (err) {
    loggerService.error('Failed to get toy', err)
    res.status(500).send({ err: 'Failed to get toy' })
  }
}

export async function addToy(req, res) {
  try {
    const toy = req.body
    const addedToy = await toyService.add(toy)
    res.json(addedToy)
  } catch (err) {
    loggerService.error('Failed to add toy', err)
    res.status(500).send({ err: 'Failed to add toy' })
  }
}

export async function updateToy(req, res) {
  const{loggedinUser} = req
  try {
    const toy = { ...req.body, _id: req.params.id }
    const updatedToy = await toyService.update(toy)
    socketService.broadcast({type: 'admin-change',data: `update${toy.name}`,  userId: loggedinUser._id,})
    res.json(updatedToy)
  } catch (err) {
    loggerService.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })
  }
}

export async function removeToy(req, res) {
  const{loggedinUser} = req  
  try {
    const toyId = req.params.id
    const deletedCount = await toyService.remove(toyId)
    socketService.broadcast({type: 'admin-change',data: `remove toy`,  userId: loggedinUser._id,})    
    res.send(`${deletedCount} toys removed`)
  } catch (err) {
    loggerService.error('Failed to remove toy', err)
    res.status(500).send({ err: 'Failed to remove toy' })
  }
}

export async function addToyMsg(req, res) {
  const { loggedinUser } = req  
  try {
    const toyId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
      createdAt: Date.now(),
    }
    const savedMsg = await toyService.addMsg(toyId, msg)
    socketService.broadcast({type: 'chat-add-msg',data:savedMsg,room:toyId,userId:loggedinUser._id} )
    socketService.broadcast({type: 'typing-msg',data:{Typing:false, txt:''},room:toyId,userId:loggedinUser._id} )
    res.json(savedMsg)
  } catch (err) {
    loggerService.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })
  }
}

export async function removeToyMsg(req, res) {
  const { loggedinUser } = req
  try {
    const { id: toyId, msgId } = req.params

    const removedId = await toyService.removeToyMsg(toyId, msgId)
    res.send(removedId)
  } catch (err) {
    loggerService.error('Failed to remove toy msg', err)
    res.status(500).send({ err: 'Failed to remove toy msg' })
  }
}
