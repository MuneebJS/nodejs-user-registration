var strategies = require('../lib/passport')
var messageHandler = require('../lib/messageHandler')
var responseHandler = require('../lib/response-handler')
var httpStatus = require('../config/status-codes')
var appConstants =  require('../config/constants') //ERROR__PERMISSION

jwt_middleware = {
  validateJWT: function(req, res, next,jwtOptions,allowRoles){
      return strategies.getJWTValidate(jwtOptions, req).then((result) => {
        res.userDecodedToken = result
        // allowRoles will restrict user to speific user role
        if(typeof allowRoles !== 'undefined'){
            var currentRole = res.userDecodedToken.user.roles[0].dataValues.name
            if(jwt_middleware.isAllow(allowRoles,currentRole)){
               next()
            }else{
                  res.json(responseHandler.errorResponse(messageHandler.ERROR__PERMISSION, {}, httpStatus.VALIDATION_ERROR));
            }
        }else{
           //No rules applied
            next()
        }
      }).catch((err) => {
        res.json(err)
      })
  },
  isAllow: function(allowRoles,currentRole){
     return (allowRoles.indexOf(currentRole) != -1);
  }
}
module.exports = jwt_middleware;
