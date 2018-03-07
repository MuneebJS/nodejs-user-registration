var appConstants = require('../config/constants');
var models = require('../models/index')

userRoles = {

  saveUserRole:(userID, rolename) => {
    //console.log("userID", userID, "rolename:", rolename);
     return new Promise(function (resolve, reject) {
         models.roles.findOne({where: {
           name: rolename
         }}).then((roleObject) => {
         //console.log("Roles Object ::",roleObject);
           if (roleObject) {
             var userRoleData = {
               user_id: userID,
               role_id: roleObject.id
             }
             models.user_roles.create(userRoleData).then((result) => {
               models.roles.findOne(
                 {
                   where:{
                      id:result.role_id
                  }
                }
                ).then(function(roleRes){
                    resolve(roleRes);
               }).catch(function(error){
                reject(false) 
               });
               
             }).catch(function (validations) {
               reject(false)
             })
           } else {
             console.log('Else Occur ::')
             reject(false)
           }
         })
       });
   }

}

module.exports = userRoles
