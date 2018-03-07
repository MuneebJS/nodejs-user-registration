var httpStatus = require('../config/status-codes')
var responseHandler = require('../lib/response-handler')
var appConstants = require('../config/constants')

var validator = {
  validateEmployeeInfo: (req, res) => {
    return new Promise(function (resolve, reject) {
      req.checkBody('first_name', 'Name cannot be empty').optional().notEmpty()
      req.checkBody('last_name', 'Name cannot be empty').optional().notEmpty()
      req.checkBody('email', 'Email address can not be empty').optional().notEmpty()
      req.checkBody('email', 'Invalid email address').optional().isEmail()
      // req.checkBody('phone_number', 'Invalid Phone number').optional().matches(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/).notEmpty()
      req.checkBody('password', 'Password can not be empty').optional().notEmpty()
      //req.checkBody('password', 'Password must be minimum 6 characters, one special character and one numeric').optional().matches(/((?=.*\d)(?=.*[a-z])(?=.*[~`!@#$%^&*()_={}:";'<>?,.|]).{6,50})/)
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

  validateCompanyInfo: (req, res) => {
    return new Promise(function (resolve, reject) {
      req.checkBody('first_name', 'Name cannot be empty').optional().notEmpty()
      req.checkBody('last_name', 'Name cannot be empty').optional().notEmpty()
      req.checkBody('email', 'Email address can not be empty').optional().notEmpty()
      req.checkBody('email', 'Invalid email address').optional().isEmail()
      // req.checkBody('phone_number', 'Invalid Phone number').optional().matches(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/).notEmpty()
      req.checkBody('password', 'Password can not be empty').optional().notEmpty()
      req.checkBody('file', 'Please attach your company logo').optional().notEmpty()
      //req.checkBody('password', 'Password must be minimum 6 characters, one special character and one numeric').optional().matches(/((?=.*\d)(?=.*[a-z])(?=.*[~`!@#$%^&*()_={}:";'<>?,.|]).{6,50})/)
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

  validateChangePassword: (req, res) => {
    return new Promise(function (resolve, reject) {
      req.checkBody('old_password', 'Password can not be empty').notEmpty()
      //req.checkBody('new_password', 'Password must be minimum 8 characters, one special character and one numeric').matches(/((?=.*\d)(?=.*[a-z])(?=.*[~`!@#$%^&*()_={}:";'<>?,.|]).{6,50})/)
      req.checkBody('new_confirm_password', 'Confirm Password can not be empty').notEmpty()
      req.checkBody('new_confirm_password', 'Confirm Password can not be match with new password').equals(req.body.new_password)
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

  validateForgetPassword: (req, res) => {
    return new Promise(function (resolve, reject) {
      req.checkBody('new_password', 'Password can not be empty').notEmpty()
      //req.checkBody('new_password', 'Password must be minimum 8 characters, one special character and one numeric').matches(/((?=.*\d)(?=.*[a-z])(?=.*[~`!@#$%^&*()_={}:";'<>?,.|]).{6,50})/)
      req.checkBody('new_confirm_password', 'Confirm Password can not be empty').notEmpty()
      req.checkBody('new_confirm_password', 'Confirm Password can not be match with new password').equals(req.body.new_password)
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
