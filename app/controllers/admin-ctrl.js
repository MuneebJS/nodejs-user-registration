var models = require('../models/index')
var responseHandler = require('../lib/response-handler')
var httpStatus = require('../config/status-codes')
var appConstants = require('../config/constants')
var messageHandler = require('../lib/messageHandler')

var AdminCtrl = {
  updateUser: function(req, res){
      models.users.update(req.body.user,
        { where: { id: req.body.user_id }, validate: false })
        .then(function(response){
          console.log("data has been updated", response)
          res.json(responseHandler.successResponse(messageHandler.SUCCESS, {}, httpStatus.SUCCESS))
        }).catch(function(error){
            res.json(responseHandler.successResponse(messageHandler.FAILURE, error, httpStatus.VALIDATION_ERROR))
        })

  },
  getUsers: function(req, res){
          var limit = 20;   // number of records per page
          var offset = 0;
          models.users.findAndCountAll().then(function (data) {
              var page = req.params.page;      // page number
              var pages = Math.ceil(data.count / limit);
              offset = limit * (page - 1);
              models.users.findAll(
                  {
                      limit: limit,
                      offset: offset,

                  }
              ).then(function (result) {
                  var finalResponse = {
                      'result': result, 'count': data.count, 'pages': pages
                  }
                  res.json(responseHandler.successResponse(messageHandler.SUCCESS, finalResponse, httpStatus.SUCCESS));
              }).catch(function (error) {
                  res.json(responseHandler.successResponse(messageHandler.FAILURE, error, httpStatus.VALIDATION_ERROR));
              })
          }).catch(function (error) {
              res.json(responseHandler.errorResponse(messageHandler.FAILURE, error, httpStatus.VALIDATION_ERROR));
          })
  },
  activateUser:function(req, res){
     var userId = req.params.user_id
     var action = req.params.action
     console.log("user id", userId);
     switch (action) {
       case 'activate':
         models.users.update({
          activation_code: '',
           status: appConstants.USER_ACTIVE
            }, {
           where: {
             id: userId
           }
          }).then(function(result){
            console.log("=================activate user=================", result)
            res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_ACTIVATED, {}, httpStatus.SUCCESS));
          }).catch(function(error){
            console.log("error", error);
            res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_ACTIVATION_CODE, {}, httpStatus.VALIDATION_ERROR));
          });
         break;
        case 'deactivate':

        models.users.update(
            {
              status: appConstants.USER_INACTIVE
            },
            {
              where:{id: userId}
            }).then(function(result){
             console.log("=================deactivate user=================", result);
           res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_DEACTIVATED, {}, httpStatus.SUCCESS));
         }).catch(function(error){
           console.log("error", error);
           res.json(responseHandler.successResponse(messageHandler.ERROR_AUTH_USER_DEACTIVATION_CODE, {}, httpStatus.VALIDATION_ERROR));
         });
         break;
       default:

     }
  }
};


module.exports = AdminCtrl;
