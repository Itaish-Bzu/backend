import { loggerService } from './logger.service.js'
import { Server } from 'socket.io'

var gIo = null


export const socketService = {
        broadcast
}

export function setupSocketAPI(http) {
  gIo = new Server(http, {
    cors: {
      origin: '*',
    },
  })
  gIo.on('connection', (socket) => {
    loggerService.info(`New connected socket [id: ${socket.id}]`)
    socket.on('disconnect', (socket) => {
      loggerService.info(`Socket disconnected [id: ${socket.id}]`)
    })

    socket.on('chat-set-topic', (topic) => {
      if (socket.myTopic === topic) return
      if (socket.myTopic) {
        socket.leave(socket.myTopic)
        loggerService.info(
          `Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`
        )
      }
      socket.join(topic)
      socket.myTopic = topic
    })

    socket.on('set-user-socket', (userId) => {
      loggerService.info(
        `Setting socket.userId = ${userId} for socket [id: ${socket.id}]`
      )
      socket.userId = userId
    })
    socket.on('unset-user-socket', () => {
      loggerService.info(`Removing socket.userId for socket [id: ${socket.id}]`)
      delete socket.userId
    })

    socket.on('chat-send-msg', (msg) => {
      loggerService.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
      gIo.to(socket.myTopic).emit('chat-add-msg', msg)
    })
      socket.on('chat-typing-msg', async (user) => {        
      loggerService.info(`Typing socket.userId for socket [id: ${socket.id}]`)
      socket.broadcast.to(socket.myTopic).emit('typing-msg',{Typing:true, txt:`${user.fullname}:typing...`})
    })
  })
}

async function broadcast({ type, data, room = null, userId }) {
    userId = userId.toString()
    
    loggerService.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        loggerService.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        loggerService.info(`Broadcast to all excluding user: ${userId}`)        
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        loggerService.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        loggerService.info(`Emit to all`)
        gIo.emit(type, data)
    }
}


async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}
async function _getAllSockets() {
    const sockets = await gIo.fetchSockets()
    return sockets
}