const config = require('../../config')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId
const statuses = config.dataSettings.call.statuses
const defaults = config.dataSettings.call.defaults

const schema = new Schema({
  call_id: {
    type: String,
    required: 'CallIdIsRequired',
    maxlength: 40,
    index: true
  },
  room: {
    type: ObjectId,
    ref: 'rooms',
    index: true
  },
  user: {
    type: ObjectId,
    ref: 'users',
    index: true
  },
  status: {
    type: String,
    enum: statuses,
    default: defaults.status,
    required: 'StatusIsRequired',
    maxlength: 50,
    index: true
  },
  ip_address: {
    type: String,
    required: true,
    maxlength: 50,
    index: true
  },
  process_name: {
    type: String,
    required: 'ProcessNameIsRequired',
    maxlength: 50
  },
  geoip: {
    continent: {
      code: {
        type: String,
        maxlength: 3
      },
      name: {
        type: String,
        maxlength: 50
      }
    },
    country: {
      code: {
        type: String,
        maxlength: 3,
        index: true
      },
      name: {
        type: String,
        maxlength: 50
      },
      is_eu: {
        type: Boolean
      }
    },
    city_name: {
      type: String,
      maxlength: 50
    }
  }
}, {
  timestamps: true
})

schema.index({
  createdAt: 1
})
schema.index({
  updatedAt: 1
})
module.exports = mongoose.model('calls', schema)
