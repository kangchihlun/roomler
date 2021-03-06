const roomService = require('../../services/room/room-service')
const config = require('../../../config')
const wsDispatcher = require('../ws/ws-dispatcher')

class RoomController {
  async get (request, reply) {
    const user = request.user
    const result = await roomService.get(user && user.user ? user.user._id : null, request.query)
    reply.send(result)
  }

  async getAll (request, reply) {
    const result = await roomService.getAll(request.user.user._id, request.query.page, request.query.size)
    reply.send(result)
  }

  async create (request, reply) {
    const payload = request.body
    let parentRoom = null
    if (payload.parent_id) {
      parentRoom = await roomService.get(request.user.user._id, {
        id: payload.parent_id
      }, ['owner', 'moderators'])
    }
    roomService.slugify(payload, parentRoom)
    const result = await roomService.create(request.user.user._id, payload)
    const parents = result.is_open ? await roomService.getParents(result) : []
    wsDispatcher.dispatch(config.wsSettings.opTypes.roomCreate, [result, ...parents], true)
    reply.send(result)
  }

  async update (request, reply) {
    const payload = request.body
    const id = request.params.id
    const update = {
      $set: payload
    }
    let result
    let children = []
    if (!payload.name) {
      result = await roomService.update(request.user.user._id, id, update)
    } else {
      // slugify using parent's name and rename the children
      const room = await roomService.get(request.user.user._id, {
        id
      })
      const parentRoom = await roomService.getParent(room)
      roomService.slugify(payload, parentRoom)
      result = await roomService.update(request.user.user._id, id, update)
      await roomService.renameChildren(room.name, payload.name)
      children = await roomService.getChildren(result, request.user.user._id)
    }
    const response = { room: result, children }
    const parents = result.is_open ? await roomService.getParents(result) : []
    wsDispatcher.dispatch(config.wsSettings.opTypes.roomUpdate, [response, ...parents], true)
    reply.send(response)
  }

  async delete (request, reply) {
    const room = await roomService.get(request.user.user._id, {
      id: request.params.id
    })
    const children = await roomService.getChildren(room, request.user.user._id)
    const parents = await roomService.getParents(room)

    const isOwner = !!([room, ...parents].find(r => r.owner.toString() === request.user.user._id.toString()))
    if (!isOwner) {
      throw new Error('Delete operation not allowed! You need to be owner of either the this or any parent room.')
    }
    const result = await roomService.delete(room)
    const response = {
      room,
      children,
      result
    }
    wsDispatcher.dispatch(config.wsSettings.opTypes.roomDelete, [response], true)
    reply.send(response)
  }
}

module.exports = new RoomController()
