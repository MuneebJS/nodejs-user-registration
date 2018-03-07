var models = require('../models/index')
var tokenManager = require('./token-manager')
var appConstants = require('../config/constants')
var responseHandler = require('./response-handler')
var messageHandler = require('./messageHandler')
var httpStatus = require('../config/status-codes')

var CanddtSocialAuth = {
  socialLogin: function (id, type) {
    return new Promise((resolve, reject) => {
      models.user_social_accounts.findOne({
        where: {
          social_id: id,
          strategy_type: type
        },
        include: [{
          model: models.users,
          include: [{
            model: models.roles
          }]
        },
        ],
      }).then(function (data) {
        if (data && data.user.roles[0].name === appConstants.COMPANY_ROLE) {
          models.company_profile.findOne({
            where: { user_id: data.user.id },
            include: {
              model: models.files
            }
          }).then((result) => {
            console.log("response come from company profile", result);
            data.user.profile = result
            resolve(data)
          })
        } else if (data && data.user.roles[0].name === appConstants.EMPLOYEE_ROLE) {
          console.log("else if ran")
          models.profile.findOne({
            where: { user_id: data.user.id }
          }).then((result) => {
            data.user.profile = result
            console.log("response come from profile", result);
            resolve(data)
          }).catch(err => {
            console.log("err from of then 2")
          })
        } else {
          reject(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_LINKEDIN_ACCOUNT, {}, httpStatus.VALIDATION_ERROR))//
        }
      }).catch(function (error) {
        console.log("catch 2")
        reject(error)
      });
    });
  },

  
  isSocialAccount: function (id, type) {
    return new Promise((resolve, reject) => {
      models.user_social_accounts.count({
        where: {
          social_id: id,
          strategy_type: type
        }
      }).then(function (data) {
        resolve(data)
      }).catch(function (error) {
        console.log("catch 1")
        reject(error)
      });
    });
  }

}

module.exports = CanddtSocialAuth;
