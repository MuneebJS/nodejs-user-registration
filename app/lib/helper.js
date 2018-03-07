var appConstants = require('../config/constants')
var env = process.env.NODE_ENV || 'development'
var endpoints = require('../config/endpoints')[env]
helper = {
  randomString: (length) => {
    var mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'
    var result = ''
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)]
    return result
  },

  postOptions: (route, accessToken) => {
    return {
      method: "POST",
      headers: { 'content-type': 'application/json' },
      url: `${endpoints.API}/${route}`,
      // body: {access_token: accessToken}
      json: { access_token: accessToken }
    }
  }
}

module.exports = helper
