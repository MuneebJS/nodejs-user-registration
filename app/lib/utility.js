
var models = require('../models/index')
var appConstants = require('../config/constants')
var fileConstants = require('../config/file')
var messageHandler = require('../lib/messageHandler')
var responseHandler = require('../lib/response-handler')
var httpStatus = require('../config/status-codes')
var sequelize = require('sequelize')
var jwt = require('jsonwebtoken')
var jwtConfig = require('../config/jwt-config')
var fileUpload = require('../lib/file-upload');
var constants = require('../config/constants');
var jwtOptions = {}
jwtOptions.secretOrKey = jwtConfig.jwtSecret
var fileFolderPath = null;

utility = {
  getJwtToken: (id, email) => {
    var jwtexpiresIn = appConstants.JWT_EXPIRE_IN
    var token = jwt.sign({ user_id: id, email: email }, jwtOptions.secretOrKey, { expiresIn: jwtexpiresIn })
    console.log('test token', token)
    return token
  },

  saveCompanyProfile: (id, userData, authUser, res) => {
    //user id exist it will update company profile otherwise it create new
    //console.log("auth user id found",authUser.user_id);
    if (id) {

      //check logo extention if exists
      if (userData && userData.file) {
        var isExtensionValid = fileUpload.getExtension(userData.file.mime_type, fileConstants.LOGO_CONTENT_TYPE);
        if (!isExtensionValid) {
          res.json(responseHandler.errorResponse(messageHandler.ERROR_NOT_VALID_FILE_EXTENSION, {}, httpStatus.VALIDATION_ERROR));
          return false;
        }
      }

      models.company_profile.update(userData, {
        where: { id: id, user_id: authUser.user_id }
      }).then(function (companyProfileUpdate) {
        if (companyProfileUpdate == 1) {
          //check if file updated or not
          if (userData && userData.file) {
            fileFolderPath = fileConstants.FILE_SYSTEM + fileConstants.LOGO_DIR + id + "/";
            models.files.save(userData, fileFolderPath, fileConstants.LOGO_CONTENT_TYPE).then(function (fileResult) {
              //update field id after file data inserted in column
              models.company_profile.update({ file_id: fileResult.id },
                { where: { id: id }, validate: false }).then(function (updated) {
                  utility.generateProfileUpdateRes(id, authUser.user_id, appConstants.COMPANY_ROLE, res);
                }).catch(function (error) {
                  res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                })
            })
          } else {
            utility.generateProfileUpdateRes(id, authUser.user_id, appConstants.COMPANY_ROLE, res);
          }
        } else {
          res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_PROFILE_UPDATED, {}, httpStatus.VALIDATION_ERROR));
        }


      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });
    } else {

      models.company_profile.create(userData).then(function (result) {
        if (userData && userData.file) {
          //function for check file extension
          var isExtensionValid = fileUpload.getExtension(userData.file.mime_type, fileConstants.LOGO_CONTENT_TYPE);
          console.log("isExtensionValid", isExtensionValid);
          if (isExtensionValid) {
            fileFolderPath = fileConstants.FILE_SYSTEM + fileConstants.LOGO_DIR + result.id + "/";
            //console.log("finalFolderPathh",fileFolderPath);
            models.files.save(userData, fileFolderPath, fileConstants.LOGO_CONTENT_TYPE).then(function (fileResult) {

              models.company_profile.update({ file_id: fileResult.id },
                { where: { id: result.id }, validate: false }).then(function (updated) {
                  res.json(responseHandler.successResponse({}, result, httpStatus.SUCCESS));
                }).catch(function (error) {
                  res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                })
            })
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_NOT_VALID_FILE_EXTENSION, {}, httpStatus.VALIDATION_ERROR));
          }
        } else {
          res.json(responseHandler.successResponse({}, result, httpStatus.SUCCESS));
        }

      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });

    }
  },

  generateProfileUpdateRes: (profileId, userId, role, res) => {
    models.users.findOne({ where: { id: userId } }).then(function (user) {
      var profileObj = [];
      if (role === appConstants.COMPANY_ROLE) {
        profileObj = models.company_profile.findOne({ where: { user_id: user.id }, include: { model: models.files } })
      } else if (role === appConstants.EMPLOYEE_ROLE) {
        profileObj = models.profile.findOne({ where: { user_id: user.id } })
      }

      profileObj.then(function (profile) {
        models.user_roles.findOne({ where: { user_id: userId } }).then(function (role) {
          models.roles.findOne({ where: { id: role.role_id } }).then(function (roleName) {
            models.user_tokens.findOne({
              where: { user_id: user.id, valid: 1 },
              attributes: ['token', 'device_type', 'device_id', 'user_id', 'expired_at', 'valid']
            }).then(function (token) {

              let userObj = {};
              userObj = user;
              userObj.roles = [roleName];
              userObj.profile = profile;
              generatedData = responseHandler.generateAuthResponse(userObj, token)
              res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_PROFILE_UPDATED, generatedData, httpStatus.SUCCESS));

            }).catch(function (error) {
              res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
            });
          }).catch(function () {
            res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
          });
        }).catch(function () {
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
        });
      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });
    }).catch(function (error) {
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
    });

  },

  saveUserProfile: (id, userData, authUser, res) => {
    //user id exist it will update user profile otherwise it create new
    console.log("user profile update", authUser);
    if (id) {
      var userInfo = {};
      var userProfileInfo = {};
      userProfileInfo.country_of_residence = userData.country_of_residence;
      userInfo.first_name = userData.firstName;
      userInfo.last_name = userData.lastName;
      userInfo.phone_number = userData.phoneNumber;
      userInfo.previous_company = userData.previous_company;

      models.profile.update(userProfileInfo, { where: { id: id, user_id: authUser.user_id } }).then(function (profileUpdate) {
        models.users.update(userInfo, { where: { id: authUser.user_id } }).then(function (userProfileUpdate) {
          if (userProfileUpdate == 1) {
            utility.generateProfileUpdateRes(id, authUser.user_id, appConstants.EMPLOYEE_ROLE, res);
            // utility.getSocialProfile(authUser.user_id,'employee').then((result)=>{
            //       console.log("profile updated");
            //       var finalObject={
            //       email: result[0].dataValues.email,
            //        first_name: result[0].dataValues.first_name,
            //        last_name: result[0].dataValues.last_name,
            //         user_id: result[0].dataValues.id,
            //         role: result[0].roles,
            //         user: result[0],
            //         profileData:result[0].profile
            //       }
            //       res.json(finalObject);

            // }).catch((error)=>{
            //     console.log("profile updated error",error);
            // });
            //res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_PROFILE_UPDATED, {}, httpStatus.SUCCESS));
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_PROFILE_UPDATED, {}, httpStatus.VALIDATION_ERROR));
          }
        }).catch(function (error) {
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
        });
      }).catch(function (error) {
        //console.log("first", error);
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });

    } else {
      models.profile.create(userData).then(function (userProfileCreate) {
        console.log("profile created ", userProfileCreate.dataValues);
        utility.getSocialProfile(userProfileCreate.dataValues.user_id, constants.EMPLOYEE_ROLE).then((result) => {
          console.log("profile get social profile ", result[0].dataValues);

          var finalObject = {
            email: result[0].dataValues.email,
            first_name: result[0].dataValues.first_name,
            last_name: result[0].dataValues.last_name,
            user_id: result[0].dataValues.id,
            role: result[0].roles,
            user: result[0],
            profileData: result[0].profile
          }
          res.json(finalObject);
        }).catch((error) => {
          console.log("profile updated error", error);
        });
        //res.json(responseHandler.successResponse({}, userProfileCreate, httpStatus.SUCCESS));
      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });
    }
  },

  createSocialProfile: (roleType, profileData) => {
    console.log("create social profile roletype ======.....= ", roleType)
    return new Promise((resolve, reject) => {

      if (roleType === constants.EMPLOYEE_ROLE) {
        console.log("employee case ran", roleType)
        models.profile.create(profileData).then(result => {
          resolve(result)
        }).catch(error => {
          console.log("create user profile error", error)
          reject(error)
        });
      }

      else if (roleType === "company") {
        models.company_profile.create(profileData).then(result => {
          resolve(result)
        }).catch(error => {
          console.log("create company profile error", error)
          reject(error)

        });
      }

    })//promise end
  },


  getSocialProfile: (userId, roleType) => {
    return new Promise((resolve, reject) => {
      switch (roleType) {
        case 'company':
          console.log("fetch profile from company");
          return models.users.findAll({
            where: {
              id: userId
            },
            include: [{
              model: models.company_profile,
              attributes: ['id', 'name']
            },
            {
              model: models.roles,
              attributes: ['id', 'name']
            }
            ]
          }).then((result) => {
            resolve(result)
          }).catch((error) => {
            console.log("error", error);
            reject(error);
          });

        case constants.EMPLOYEE_ROLE:
          console.log("fetch profile from employeee");
          return models.users.findAll({
            where: {
              id: userId
            },
            include: [{
              model: models.profile,
              attributes: ['id', 'dob', 'country_of_residence']
            },
            {
              model: models.roles,
              attributes: ['id', 'name']
            }
            ]
          }).then((result) => {
            resolve(result)
          }).catch((error) => {
            reject(error);
          });
        default:
      }

    })//promise end
  }


}

module.exports = utility
