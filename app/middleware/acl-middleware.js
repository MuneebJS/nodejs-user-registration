var request = require('request')
var endpoints = require('../config/endpoints')
var env = process.env.NODE_ENV || 'development'
var endpoints = require('../config/endpoints')[env]

var acl_middleware = {
  checkAclPermission: (token, method) => {
    return new Promise(function (resolve, reject) {
      request.get(
        {
          url: endpoints.API + 'checkPermission?method=' + method,
          json: true,
          headers: {
            'X-Auth-Token': token
          }
        },
                 function (error, result, object) {
                   if (result) {
                     resolve(result)
                   } else {
                     reject(error)
                   }
                 }
           )
    })
  }
}

module.exports = acl_middleware
