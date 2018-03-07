
var models = require('../models/index')
var data_rec
var acl = {
  check: function (permission, userid, role_id) {
    return new Promise(function (resolve, reject) {
      if (role_id == 5)    //  Allow Admin All Right
            { resolve('true') }

      acl.userPermissions(permission, userid).then((promisreturn) => {
        if (promisreturn == 'yes') {
          resolve(promisreturn)
        } else {
          acl.groupPermissions(permission, role_id).then((grouppromisreturn) => {
            resolve(grouppromisreturn)
          }).catch(function (e) {
            reject(e)
          })
        }
      }).catch(function (e) {
        if (e == 'no') {
          acl.groupPermissions(permission, role_id).then((grouppromisreturn) => {
            resolve(grouppromisreturn)
          }).catch(function (e) {
            reject(e)
          })
        } else {
          reject(e)
        }
      })
    })
  },
  gellAllPermissionList: function (role_id, user_id) {
    return new Promise(function (resolve, reject) {
      models.sequelize.query('select up.permission_name from users u , user_permissions up where u.id = up.user_id and up.permission_type != 0 and u.id  = :user_id ',
        { replacements: { user_id: user_id}, type: models.sequelize.QueryTypes.SELECT }
      ).then(userPermissions => {
        if (userPermissions) {
          /// Internal Promise for role permission
            /**************************/
          return new Promise(function (resolve, reject) {
            models.sequelize.query('select rp.permission_name from role_permissions rp ,user_roles ur where  ur.role_id = rp.role_id and rp.permission_type != 0 and ur.role_id = :role_id and ur.user_id = :user_id ',
                    { replacements: { user_id: user_id, role_id: role_id }, type: models.sequelize.QueryTypes.SELECT }
                  ).then(rolePermissions => {
                    if (rolePermissions) {
                      resolve(rolePermissions)
                    } else {
                      reject(false)
                    }
                  })
          }).then((RolePermissionsPromise) => {
            var cocatedarray = RolePermissionsPromise.concat(userPermissions)
            return acl.uniqueArray(cocatedarray).then((concatpromise) => {
                        // resolve(concatpromise);
                        /********************/
              return acl.filterUserPermisions(concatpromise, user_id).then((filtered) => {
                var f = []
                for (var i = 0; i < filtered.length; i++) {
                  for (var j = 0; j < concatpromise.length; j++) {
                    if (filtered[i].permission_name == concatpromise[j]) {
                      var index = concatpromise.indexOf(concatpromise[j])
                      concatpromise.splice(index, 1)
                                        // concatpromise.delete[concatpromise.indexOf(concatpromise[j])];
                      console.log(concatpromise[j])
                    }
                  }
                }
                resolve(concatpromise)
              }).catch(function (e) {
                reject(false)
              })
                        /*********************/
            }).catch(function (e) {
              reject(false)
            })
          }).catch(function (e) {
            reject(false)
          })
            /****************************/
          resolve(userPermissions)
        } else {
          reject(false)
        }
      })
    })
  },
  uniqueArray: function (conacatArray) {
    // console.log("IN FUNC::",conacatArray);
    return new Promise(function (resolve, reject) {
      var n = []
      for (var i = 0; i < conacatArray.length; i++) {
          // console.log(conacatArray[i].permission_name);
        if (n.indexOf(conacatArray[i].permission_name) == -1) n.push(conacatArray[i].permission_name)
      }

      resolve(n)
    })
  },
  filterUserPermisions: function (uniequeArr, user_id) {
    return new Promise(function (resolve, reject) {
              // resolve("asadraza");
      models.sequelize.query('select up.permission_name from users u , user_permissions up where  u.id = up.user_id and up.permission_type = 0 and  u.id  = :user_id and  permission_name in (:permission_name);',
                { replacements: { user_id: user_id, permission_name: uniequeArr }, type: models.sequelize.QueryTypes.SELECT }
              ).then(rolePermissions => {
                if (rolePermissions) {
                  resolve(rolePermissions)
                } else {
                  reject(false)
                }
              })
    })
  },
  userPermissions: function (permission, userid) {
    return new Promise(function (resolve, reject) {
      models.user_permissions.findAndCountAll({
        where: {permission_name: permission, user_id: userid },
    		   offset: 0,
    		   limit: 5
    		})
    		.then(result => {
      if (result.count > 0) {
        models.user_permissions.findOne({ where: {permission_name: permission, user_id: userid } })
             .then(res => {
               if (!res.permission_type) {
                 console.log('User Level Restriction: ', res.permission_type)
                 reject('false')
               } else {
                 resolve('yes')
               }
             })
      } else {
        reject('no')
      }
    		})
    })
  },
  groupPermissions: function (permission, role_id) {
    return new Promise(function (resolve, reject) {
      models.role_permissions.findAndCountAll({
        where: {permission_name: permission, role_id: role_id },
        offset: 0,
        limit: 5
      })
        .then(result => {
          if (result.count > 0) {
            models.role_permissions.findOne({ where: {permission_name: permission, role_id: role_id } })
             .then(res => {
               if (!res.permission_type) {
                 console.log('Role Level Restriction: ', res.permission_type)
                 reject('false')
               } else {
                 resolve('true')
               }
             })
          } else {
            reject('false')
          }
        })
    })
  },
  saveUserRole: function (rolename, userid) {
    return new Promise(function (resolve, reject) {
    // console.log("Role Name ::",rolename);
    // console.log("UserId:: ",userid);

      models.roles.findOne({where: {
        name: rolename
      }}).then((roleObject) => {
    //  console.log("Roles Object ::",roleObject);
        if (roleObject) {
          var userRoleData = {
            user_id: userid,
            role_id: roleObject.id
          }
          models.user_roles.create(userRoleData).then((result) => {
            resolve(result)
          }).catch(function (validations) {
            reject(false)
          })
        } else {
          console.log('Else Occur ::')
          reject(false)
        }
      })
    })
  },
  gellAclList: function (user_id) {
    var finalres = []
    return new Promise(function (resolve, reject) {
      models.user_roles.findOne({where: {
        user_id: user_id
      }}).then((result) => {
        if (result) {
          acl.gellAllPermissionList(result.role_id, user_id).then((userPermissionsPromise) => {
            resolve(userPermissionsPromise)
          }).catch(function (e) {
            reject(false)
          })
        } else {
          reject(false)
        }
      })
    })
  },
  getUserRole: function (user_id) {
  /**
  * @todo: Need to catch error exception on sequelize level
  */
    return new Promise(function (resolve, reject) {
      models.sequelize.query('select r.name from users u,user_roles ur,roles r where u.id = ur.user_id and r.id = ur.role_id and u.id= :user_id',
        { replacements: { user_id: user_id}, type: models.sequelize.QueryTypes.SELECT }
      ).then(roles => {
        console.log('here')
        if (roles) {
          resolve(roles)
        } else {
          console.log('there')
          reject(false)
        }
      })
    })
  }
}
module.exports = acl
