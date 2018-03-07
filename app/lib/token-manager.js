var moment = require('moment')
var model = require('../models/index')
var responseHandler = require('./response-handler')
var messageHandler = require('./messageHandler')
var httpStatus = require('../config/status-codes') // htp status code
var Promise = require('promise')
var tokenManager = {
  insertUpdateToken: function (tokenItem) {
    return model.user_tokens.upsert(tokenItem)
  },

  isExist: function (userId, otherParams) {
    var whereRow = {
      user_id: userId,
      valid: 1
    }
    // if (otherParams.device_id && otherParams.device_type) {
    //   whereRow.device_id = otherParams.device_id // req.body
    //   whereRow.device_type = otherParams.device_id // req.body
    // }

    // if (otherParams.requestToken) { // check if token exist in request object
    //   whereRow.token = otherParams.requestToken
    // }
    return model.user_tokens.findOne({ where: whereRow })
  },
  invalidateToken: function (userId, otherParams, row) {
    var whereRow = {
      user_id: userId,
      valid: 1
    }
    if (row && row.id) {
      whereRow.id = row.id
    }
    if (otherParams && otherParams.device_id && otherParams.device_type) {
      whereRow.device_id = otherParams.device_id // req.body
      whereRow.device_type = otherParams.device_type// req.body
    }
    console.log(whereRow, 'whereRow')
    return model.user_tokens.update({
      valid: 0,
      expired_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }, {
        where: whereRow
      }).catch((err) => console.log(err))
  },
  isValid: function (decodedToken, token, otherParams) {
    return new Promise((fulfill, reject) => {
      otherParams.requestToken = token // Pass request token to function

      this.isExist(decodedToken.user_id, otherParams).then((result) => {
        if (result) {
          var storeDate = moment(result.expired_at).unix()
          var currentTime = moment().unix()
          if (currentTime < storeDate) {
            fulfill(decodedToken)
          } else {
            reject(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_TOKEN_EXPIRED, {}, httpStatus.INVALID_TOKEN))
          }
        } else {
          reject(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_TOKEN_EXPIRED, {}, httpStatus.INVALID_TOKEN))
        }
      })
    })
  }
}

module.exports = tokenManager
