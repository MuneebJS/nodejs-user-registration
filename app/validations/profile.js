var httpStatus = require('../config/status-codes')
var responseHandler = require('../lib/response-handler')
var appConstants = require('../config/constants')

var validator = {
  validateCompanyProfileInfo: (req, res) => {
    return new Promise(function (resolve, reject) {
      req.checkBody('address1', 'Address cannot be empty').optional().notEmpty()
      req.checkBody('name', 'Name cannot be empty').optional().notEmpty()
      req.checkBody('email', 'Email address can not be empty').optional().notEmpty()
      req.checkBody('email', 'Invalid email address').optional().isEmail()
      req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
          res.json(responseHandler.errorResponse(result.array(), {}, httpStatus.VALIDATION_ERROR))
          reject()
        } else {
          resolve()
        }
      })
    })
  },
  validateUserProfileInfo: (req, res) => {
    return new Promise(function (resolve, reject) {
      req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
          res.json(responseHandler.errorResponse(result.array(), {}, httpStatus.VALIDATION_ERROR))
          reject()
        } else {
          resolve()
        }
      })
    })
  }

}

module.exports = validator
