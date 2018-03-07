
var models = require('../models/index')
var moment = require('moment')
var jwt = require('jsonwebtoken')
var request = require('request')
var fs = require('fs')
var jwtConfig = require('../config/jwt-config')
var messageHandler = require('../lib/messageHandler')
var tokenManager = require('../lib/token-manager')
var utility = require('../lib/utility')
var userRoles = require('../lib/user-roles');
var responseHandler = require('../lib/response-handler')
var httpStatus = require('../config/status-codes')
var appConstants = require('../config/constants')
var fileConstants = require('../config/file')
var fileUpload = require('../lib/file-upload');
var passport = require('passport')

var morgan = require('morgan')
var validation = require('../validations/user.js')
var emailManager = require('../lib/email-manager')
var env = process.env.NODE_ENV || 'development'
var endpoints = require('../config/endpoints')[env]
var sendgrid = require('../config/sendgrid')
var helpers = require('../lib/helper')
var LinkedinAPI = require('../lib/linkedin')
var CanddtSocialAuth = require('../lib/canddt-social-auth.js')


var jwtOptions = {}

jwtOptions.secretOrKey = jwtConfig.jwtSecret

var auth = {
  signup: function (req, res) {
    var userData = req.body
    var roleName = req.params.role;
    //console.log("test", userData, roleName);
    switch (roleName) {
      case appConstants.EMPLOYEE_ROLE:
        validation.validateEmployeeInfo(req, res).then(() => {
          auth._isUser(userData.email).then(function (isUserRes) {
            if (isUserRes.isUser) {
              //user already exists
              res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_ALREADY_EXIST, {}, httpStatus.VALIDATION_ERROR))
            } else {
              // create account for user
              var socialAccount = {}
              auth.createAccount(userData, req, res, socialAccount).then(function (result) {
                //console.log('create account function call')
              }).catch(function (error) {
                res.json(responseHandler.errorResponse("Error in account creation employee", error, httpStatus.VALIDATION_ERROR))
              })

            }
          }).catch(function (error) {
            console.log("user not found", error);
          });
        }).catch(function (error) {
          console.log("validation error:", error);
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
        })
        break;
      case appConstants.COMPANY_ROLE:
        validation.validateCompanyInfo(req, res).then(() => {
          var isExtensionValid = fileUpload.getExtension(userData.file.mime_type, fileConstants.LOGO_CONTENT_TYPE);
          if (isExtensionValid) {
            auth._isUser(userData.email).then(function (isUserRes) {
              console.log("is user?Response..........", isUserRes.isUser);
              if (isUserRes.isUser) {
                //user already exists
                res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_ALREADY_EXIST, {}, httpStatus.VALIDATION_ERROR))
              } else {
                // create account for company
                var socialAccount = {}
                auth.createAccount(userData, req, res, socialAccount).then(function (result) {
                  // console.log('create account function call')
                }).catch(function (error) {
                  res.json(responseHandler.errorResponse("Error in account creation company", error, httpStatus.VALIDATION_ERROR))
                })

              }
            }).catch(function (error) {
              console.log("not found", error);
            });
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_NOT_VALID_FILE_EXTENSION, {}, httpStatus.VALIDATION_ERROR));
          }
        }).catch(function (error) {
          console.log("error:", error);
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
        })
        break;
    }
    return false;
  },

  createAccount: function (userData, req, res, socialAccount) {
    
    return new Promise(function (resolve, reject) {

      if (req.params.role === appConstants.COMPANY_ROLE) {

        var userEmail = userData.email;
        var userEmailArray = userEmail.split("@");
        var domainName = userEmailArray[1];
        if (!socialAccount) {
          models.users.findAll({
            where: {
              email: { $like: '%' + domainName }
            }
          }).then(function (domainCheck) {
            console.log('domain already exist', domainCheck.length)
            if (domainCheck.length > 0) {
              res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_DOMAIN_ALREADY_EXIST, {}, httpStatus.VALIDATION_ERROR))
            }
          }).catch(function (error) {

            reject(error)
          })
        }

      }

      var userObject = auth.makeUserObject(userData);

      models.users.create(userObject).then(function (result) {

        userRoles.saveUserRole(result.id, req.params.role).then(function (userRole) {

          var momentExpiresTimeCount = appConstants.MOMENT_EXPIRES_TIME_COUNT
          //Function for generate jwt token
          var token = utility.getJwtToken(result.id, result.email);
          //console.log("function returns token", token);

          // create user token
          var userTokenData = {
            'token': token,
            'expired_at': moment().add(momentExpiresTimeCount, jwtConfig.momentExpires.unit),
            'valid': appConstants.TOKEN_VALID,
            'user_id': result.id
          }
          models.user_tokens.create(userTokenData).then(function (userToken) {

            //update hash password in user table
            var securePassword = models.users.getPasswordHash(userData.password)
            models.users.update({
              password: securePassword
            },

              { where: { id: result.id }, validate: false }).then(function (userPasswordUpdate) {
                models.users.findOne({
                  where: { id: result.id },
                  include: [
                    { model: models.roles, attributes: ['id', 'name'] },
                    { model: models.files }
                  ]

                }).then((userRes) => {
                  //***** user role base profile created ******/
                  if (req.params.role === appConstants.COMPANY_ROLE) {
                    console.log("okkkk******", userData);
                    var userProfileObject = auth.makeCompanyProfileObject(userData, result);
                    console.log("yessss******", userProfileObject);
                    models.company_profile.create(userProfileObject).then(function (profileResult) {

                      fileFolderPath = fileConstants.FILE_SYSTEM + fileConstants.LOGO_DIR + profileResult.id + "/";

                      //function for check file extension and upload logo
                      models.files.save(userProfileObject, fileFolderPath, fileConstants.LOGO_CONTENT_TYPE).then(function (fileResult) {

                        models.company_profile.update({ file_id: fileResult.id },
                          { where: { id: profileResult.id }, validate: false }).then(function () {
                            models.company_profile.findOne({
                              where: { id: profileResult.id },
                              include: [{
                                model: models.files
                              }]
                            }).then((companyProfileRes) => {
                              let userObj = {};
                              userObj = userData;
                              userObj.id = result.id; //user id
                              userObj.roles = [userRole];
                              userObj.profile = companyProfileRes;

                              generatedData = responseHandler.generateAuthResponse(userObj, userToken)

                              //if socialAccount object is found; entry social table and in then resposne return final response
                              if (Object.keys(socialAccount).length > 0) {
                                socialAccount.user_id = result.id;
                                models.user_social_accounts.create(socialAccount).then(function (socialAccountRes) {
                                  res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_CREATED, generatedData, httpStatus.SUCCESS));
                                }).catch(function (error) {
                                  res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                                })
                              } else {
                                //sign up email
                                auth.signupEmailGenerator(userObj);
                                  res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_CREATED, generatedData, httpStatus.SUCCESS));
                              }
                            })
                          }).catch(function (error) {
                            res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                          })
                      })

                    }).catch(function (error) {
                      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                    });

                  } else if (req.params.role === appConstants.EMPLOYEE_ROLE) {

                    var userProfileObject = auth.makeUserProfileObject(userData, result);
                    models.profile.create(userProfileObject).then(function (userProfileCreate) {

                      //else keep as it is
                      let userObj = {};
                      userObj = userData;
                      userObj.roles = [userRole];
                      userObj.profile = userProfileCreate;
                      userObj.id = userData.profile.user_id;
                      //console.log("test******", userData.profile.user_id, userObj );
                      generatedData = responseHandler.generateAuthResponse(userObj, userToken);
                      //console.log("testhhhh******", generatedData );

                      //if socialAccount object is found; entry social table and in then resposne return final response
                      if (Object.keys(socialAccount).length > 0) {
                        socialAccount.user_id = result.id;
                        models.user_social_accounts.create(socialAccount).then(function (socialAccountRes) {
                          //sign up email
                          //auth.signupEmailGenerator(userObj);
                            res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_CREATED, generatedData, httpStatus.SUCCESS));
                        }).catch(function (error) {
                          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                        })
                      } else {
                          //sign up email
                          auth.signupEmailGenerator(userObj);
                            res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_CREATED, generatedData, httpStatus.SUCCESS));
                      }

                    }).catch(function (error) {
                      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                    });

                  }

                }).catch((error) => {
                  reject(error)
                })


              }).catch(function (error) {
                reject(error)
              })

          })

        }).catch(function (error) {
          res.json(error)
        })

      }).catch(function (error) {
        reject(error)
      })
    })
  },

  signupEmailGenerator: function(user) {
      emailManager.accountSignup(user.first_name, user.email);
  },

  makeCompanyProfileObject: function (userProfile, userResult) {
    var userProfileObject = {
      email: (userResult.email) ? userResult.email : null,
      name: (userProfile.name) ? userProfile.name : null,
      address1: (userProfile.address1) ? userProfile.address1 : null,
      user_id: (userResult.id) ? userResult.id : null,
      linkedin_page: (userProfile.linkedin_page) ? userProfile.linkedin_page : null,
      facebook_page: (userProfile.facebook_page) ? userProfile.facebook_page : null,
      domain_name: (userProfile.domain_name) ? userProfile.domain_name : null,
      file: (userProfile.file) ? userProfile.file : null
    }
    return userProfileObject;
  },

  makeUserProfileObject: function (userProfile, userResult) {
    var userProfileObject = {
      dob: (userProfile.dob) ? userProfile.dob : null,
      user_id: (userResult.id) ? userResult.id : null,
      country_of_residence: (userProfile.country_of_residence) ? userProfile.country_of_residence : null
    }
    return userProfileObject;
  },

  makeUserObject: function (user) {
    var userObject = {
      email: (user.email) ? user.email : null,
      password: (user.password) ? user.password : null,
      status: appConstants.USER_ACTIVE,
      address1: (user.address1) ? user.address1 : null,
      address2: (user.address2) ? user.address2 : null,
      zipcode: (user.zipcode) ? user.zipcode : null,
      ext_zipcode: (user.ext_zipcode) ? user.ext_zipcode : null,
      first_name: (user.first_name) ? user.first_name : null,
      last_name: (user.last_name) ? user.last_name : null,
      phone_number: (user.phone_number) ? user.phone_number : null,
      year_of_experience: (user.year_of_experience) ? user.year_of_experience : null,
      previous_company: (user.previous_company) ? user.previous_company : null
    }
    return userObject;
  },

  _isUser: function (email) {
    return new Promise(function (resolve, reject) {
      models.users.findAll({
        where: {
          email: email
        }
      }).then(function (user) {
        console.log('user already exist', user.length)
        if (user.length > 0) {
          resolve({ isUser: true });
        } else {
          resolve({ isUser: false });
        }
      }).catch(function (error) {
        reject(error)
      })
    })

  },


  getUserProfile: function (req, res, next) {
    passport.authenticate('linkedin-token',
      function (err, user, info) {
        res.json(user);
        (err) => {
          res.send(err)
        }
      })(req, res, next)
  },

  // local signin through passport.js
  signin: function (req, res, next) {
    // var momentExpiresTimeCount
    var jwtexpiresIn

    passport.authenticate('local-login', jwtConfig.jwtSession, function (err, user, info) {
      if (err) return res.json(responseHandler.errorResponse('error', { err: err }, httpStatus.BAD_REQUEST))
      if (!user) return res.json(responseHandler.errorResponse(info, { user: null }, httpStatus.VALIDATION_ERROR_NOT_FIELDS))
      var rememberMe = req.body.remember_me

      // @todo later we will get it's value from client
      // var rememberMe = true
      jwtexpiresIn = jwtConfig.jwtexpiresIn
      momentExpiresTimeCount = jwtConfig.momentExpires.timeCount
      if (rememberMe) {
        momentExpiresTimeCount = appConstants.MOMENT_EXPIRES_TIME_COUNT // onweek exp
        jwtexpiresIn = appConstants.JWT_EXPIRE_IN // onweek exp
      }

      var token = jwt.sign({ user_id: user.id, email: user.email }, jwtOptions.secretOrKey, { expiresIn: jwtexpiresIn })

      var userToken = {}

      tokenManager.isExist(user.id, req.body).then((row) => {
        tokenManager.invalidateToken(user.id, req.body, row).then((done) => {
          userToken = {
            token: token,
            // currently we are not sending below three values in req
            fcm_token: (req.body.fcm_token) ? req.body.fcm_token : '',
            device_type: (req.body.device_type) ? req.body.device_type : '',
            device_id: (req.body.device_id) ? req.body.device_id : '',
            user_id: user.id,
            expired_at: moment().add(momentExpiresTimeCount, jwtConfig.momentExpires.unit),
            valid: 1,
          }

          tokenManager.insertUpdateToken(userToken).then((tokenResult) => {
            if (tokenResult) {
              //console.log('insertUpdateToken result', tokenResult)
              generatedData = responseHandler.generateAuthResponse(user, userToken)
              res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_LOGIN, generatedData, httpStatus.SUCCESS));

            }
          })
        })
      })
    })(req, res, next)
  },

  logout: function (req, res) {
    var requestToken = req.headers['x-auth-token'];
    console.log("header token", requestToken);
    decoded = jwt.verify(requestToken, jwtConfig.jwtSecret)
    console.log("logout called", decoded);
    if (decoded) {
      tokenManager.invalidateToken(decoded.user_id, req.body).then((result) => {
        var message = messageHandler.SUCCESS_AUTH_LOGOUT;
        res.json(responseHandler.successResponse(message, {}, httpStatus.SUCCESS));
      });
    } else {
      res.json(responseHandler.errorResponse(message, {}, httpStatus.VALIDATION_ERROR));
    }
  },

  changePassword: (req, res) => {
    console.log("i am reached");
    var oldPassword = req.body.old_password;
    var userDecodedToken = res.userDecodedToken.auth;
    var newPassword = req.body.new_password;
    var confirmPassword = req.body.new_confirm_password;
    //console.log(userDecodedToken,"user token");
    validation.validateChangePassword(req, res).then(() => {
      //console.log("user decoded token",userDecodedToken);
      models.users.findOne({
        where: {
          id: userDecodedToken.user_id
        }
      }).then((user) => {

        if (models.users.matchPassword(oldPassword, user.password)) {
          console.log("passwords", newPassword, oldPassword);
          models.users.update({
            password: models.users.getPasswordHash(newPassword)
          }, {
              where: {
                id: user.id
              },
              validate: false
            }).then((result) => {
              console.log(result, "password updated successfull!!");
              res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_PASSWORD_CHANGED, {}, httpStatus.SUCCESS));
            }).catch((error) => {
              res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_PASSWORD_CHANGED, error, httpStatus.VALIDATION_ERROR));
            });
        } else {
          console.log("password doesnt matched", oldPassword, user.password);
          res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_PASSWORD_CHANGED, {}, httpStatus.VALIDATION_ERROR));
        }
      });

    }).catch(function (error) {
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
    });
  },

  forgotPassword: (req, res) => {
    if (req.params.code) {
      password = req.body.new_password;
      confirmPassword = req.body.new_confirm_password;

      //console.log("request params *****", req.body, password, confirmPassword);
      var decoded = jwt.verify(req.params.code, jwtConfig.jwtSecret);
      //console.log("request decoded *****", decoded);
      if (!decoded) res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_TOKEN_EXPIRED, {}, httpStatus.VALIDATION_ERROR));
      validation.validateForgetPassword(req, res).then(() => {
        // console.log("request params inside password confirm check passed", req.params);
        // console.log("decoded #######", decoded);

        models.users.findAll({
          where: { activation_code: req.params.code, id: decoded.user_id }
        }).then(function (codeStatus) {

          var securePassword = models.users.getPasswordHash(password);

          if (codeStatus.length > 0) {
            models.users.update({
              password: securePassword,
              activation_code: "",
              status: appConstants.USER_ACTIVE
            }, {
                where: {
                  id: decoded.user_id
                },
                validate: false
              })
              .then((result) => {
                res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_PASSWORD_CHANGED, {}, httpStatus.SUCCESS));
              })
              .catch((error) => {
                res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_PASSWORD_CHANGED, error, httpStatus.VALIDATION_ERROR));
              })
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_ACTIVATION_CODE_EXPIRED, error, httpStatus.VALIDATION_ERROR));
          }
        }).catch((error) => {
          res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_ACTIVATION_CODE_EXPIRED, error, httpStatus.VALIDATION_ERROR));
        })

      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });


    } else {
      var email = req.body.email;

      models.users.findOne({
        where: {
          email: email
        }
      }).then((user) => {
        console.log("user object", user);
        if (user) {
          var code = auth.getActivationCode(user.id);
          console.log("user find", user);
          models.users.update({
            activation_code: code,
            status: appConstants.USER_INACTIVE
          }, {
              where: {
                id: user.id
              }
            }).then((result) => {
              console.log("log result", result);
              emailManager.forgetPassword(code, user.email).then((done) => {
                res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_FORGET_PASSWORD, {}, httpStatus.SUCCESS));
              }).catch(function (error) {
                res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_FORGET_PASSWORD, error, httpStatus.SENDGRID_MAIL));
              });

            }).catch((error) => {
              res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_FORGET_PASSWORD, error, httpStatus.VALIDATION_ERROR));
            });

        } else {
          res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_NOT_FOUND, {}, httpStatus.VALIDATION_ERROR));
        }

      });
    }

  },

  accountVerify: (req, res) => {
    //account verification second step when user get email
    if (req.params.code) {

      //console.log("request params", req.body);
      //return false;
      oldEmail = req.body.old_email;
      isEmailChanged = req.body.is_email_changed;
      newEmail = req.body.new_email;
      newEmailConfirm = req.body.new_email_confirm;
      token = req.body.auth_token;
      isPublishJob = req.body.is_publish_job;

      var decoded = jwt.verify(req.params.code, jwtConfig.jwtSecret);

      if (!decoded) res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_TOKEN_EXPIRED, {}, httpStatus.VALIDATION_ERROR));
      console.log("decoded", decoded);

      if (isEmailChanged) {

        models.users.findOne({
          where: { activation_code: req.params.code, id: decoded.user_id }
        }).then((user) => {
          if (user.email === oldEmail) {
            if (newEmail === newEmailConfirm) {

              var userEmailArray = newEmail.split("@");
              var domainName = userEmailArray[1];

              models.users.findAll({
                where: { email: { $like: '%' + domainName }, id: { $ne: user.id } },
              }).then(function (domainCheck) {
                if (domainCheck.length > 0) {
                  res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_DOMAIN_ALREADY_EXIST, {}, httpStatus.VALIDATION_ERROR))
                } else {

                  models.users.findOne({
                    where: { activation_code: req.params.code, id: decoded.user_id }
                  }).then(function (codeStatus) {
                    if (codeStatus) {
                      var account = {
                        activation_code: "",
                        is_verified: 1,
                        email: newEmail
                      }

                      models.users.update(account, {
                        where: { id: decoded.user_id }
                      }).then((result) => {
                        //res.json(responseHandler.successResponse(messageHandler.SUCCESS_VERIFY_COMPANY_ACCOUNT, {}, httpStatus.SUCCESS));
                      }).catch((error) => {
                        res.json(responseHandler.errorResponse("Error", error, httpStatus.VALIDATION_ERROR));
                      })
                    } else {
                      res.json(responseHandler.errorResponse(messageHandler.ERROR_CODE_EXPIRED, error, httpStatus.VALIDATION_ERROR));
                    }
                  }).catch((error) => {
                    res.json(responseHandler.errorResponse(messageHandler.ERROR_CODE_EXPIRED, error, httpStatus.VALIDATION_ERROR));
                  })

                }
              }).catch(function (error) {
                reject(error)
              })

            } else {
              res.json(responseHandler.errorResponse(messageHandler.ERROR_EMAIL_CONFIRM, {}, httpStatus.VALIDATION_ERROR));
            }
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_OLD_EMAIL_NOT_MATCHED, {}, httpStatus.VALIDATION_ERROR));
          }

        }).catch((error) => {
          res.json(responseHandler.errorResponse(messageHandler.ERROR_CODE_EXPIRED, error, httpStatus.VALIDATION_ERROR));
        })
      } else {

        models.users.findOne({
          where: { activation_code: req.params.code, id: decoded.user_id }
        }).then(function (codeStatus) {

          if (codeStatus) {
            var account = {
              activation_code: "",
              is_verified: 1
            }
            models.users.update(account, {
              where: { id: decoded.user_id }
            }).then((result) => {
              //res.json(responseHandler.successResponse(messageHandler.SUCCESS_VERIFY_COMPANY_ACCOUNT, {}, httpStatus.SUCCESS));
            }).catch((error) => {
              res.json(responseHandler.errorResponse("Error", error, httpStatus.VALIDATION_ERROR));
            })
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_CODE_EXPIRED, error, httpStatus.VALIDATION_ERROR));
          }
        }).catch((error) => {
          res.json(responseHandler.errorResponse(messageHandler.ERROR_CODE_EXPIRED, error, httpStatus.VALIDATION_ERROR));
        })

      }

      if (isPublishJob && token) {

        var option = {
          method: "POST",
          headers: { 'content-type': 'application/json', 'X-Auth-Token': token },
          url: `${endpoints.JOB_API}/publishJob`,
          json: { job: { job_id: decoded.jobId } }
        }

        request(option, function (err, resp) {
          if (err) {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_JOB_PUBLISH_API, err, httpStatus.VALIDATION_ERROR));
          } else {
            res.json(responseHandler.successResponse(messageHandler.SUCCESS_VERIFY_COMPANY_ACCOUNT_WITH_JOB_PUBLISH, {}, httpStatus.SUCCESS));
          }

        });

      } else {
        res.json(responseHandler.successResponse(messageHandler.SUCCESS_VERIFY_COMPANY_ACCOUNT, {}, httpStatus.SUCCESS));
      }


    } else {
      var email = req.body.email;
      var jobId = req.body.job_id;
      models.users.findOne({
        where: { email: email }
      }).then((user) => {
        console.log("user object", user);
        if (user) {
          var code = auth.getActivationCode(user.id, jobId, email);
          // console.log("user find ******", code);
          models.users.update({
            activation_code: code,
            verified_email: email
          }, {
              where: {
                id: user.id
              }
            }).then((result) => {
              console.log("log result", result);
              emailManager.accountVerify(code, user.email).then((done) => {
                res.json(responseHandler.successResponse("Please check email", {}, httpStatus.SUCCESS));
              }).catch(function (error) {
                res.json(responseHandler.successResponse("Something wrong", error, httpStatus.SENDGRID_MAIL));
              });

            }).catch((error) => {
              res.json(responseHandler.errorResponse("wrong", error, httpStatus.VALIDATION_ERROR));
            });

        } else {
          res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_NOT_FOUND, {}, httpStatus.VALIDATION_ERROR));
        }

      });
    }
  },

  getActivationCode: (userId, jobId, email) => {
    var tokenToGenerate = { user_id: userId }
    if (jobId && email) {
      tokenToGenerate.jobId = jobId
      tokenToGenerate.verify_email = email
    }

    var code = jwt.sign(tokenToGenerate, jwtConfig.jwtSecret, { expiresIn: jwtConfig.jwtexpiresIn });
    console.log("activation_code", code);
    return code;
  },

  listAllLinkedinCompanies: (req, res, next) => {
    LinkedinAPI.getAccessToken(req.body.code, req.body.redirect_uri).then(function (accessToken) {

      setTimeout(function () {
        request(helpers.postOptions('auth/linkedin/getUserProfile', accessToken), function (err, resp) {
          let userProfile = resp.body
          LinkedinAPI.getCompanyList(accessToken).then(function (companies) {
            let linkedinUserCompany = Object.assign({}, userProfile, companies)
            linkedinUserCompany.access_token = accessToken; //linkedin access token
            res.json(responseHandler.successResponse(messageHandler.SUCCESS_LIST_ALL_LINKEDIN_COMPANIES, linkedinUserCompany, httpStatus.SUCCESS));
          }).catch(function (error) {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_LIST_ALL_LINKEDIN_COMPANIES, error, httpStatus.VALIDATION_ERROR));
          });
        });
      }, 5000);
    }).catch(function (error) {
      res.json(responseHandler.errorResponse(messageHandler.ERROR_LIST_ALL_LINKEDIN_COMPANIES, error, httpStatus.VALIDATION_ERROR))
    });
  },

  linkedInEmployeeAccessTokenAndSignup: (req, res, next) => {
    LinkedinAPI.getAccessToken(req.body.code, req.body.redirect_uri).then(function (accessToken) {
      setTimeout(function () {
        request(helpers.postOptions('auth/linkedin/getUserProfile', accessToken), function (err, resp) {
          let user = resp.body;
          let userProfile = resp.body._json;
          //console.log("helllo i am user linkedin profile****",user.name.familyName);
          //res.json(responseHandler.successResponse("employee linkedin token success", userProfile, httpStatus.SUCCESS));

          let userData = {
            "dob": "",
            "email": (userProfile.emailAddress) ? userProfile.emailAddress : "",
            "country_of_residence": 1,
            "first_name": (userProfile.firstName) ? userProfile.firstName : "",
            "last_name": (userProfile.lastName) ? userProfile.lastName : "",
            "phone_number": "",
            "previous_company": "",
            "year_of_experience": "",
            "password": "test@123"
          }

          let socialAccount = {
            strategy_type: "linkedin", //need to move to constant
            access_token: accessToken,
            social_id: userProfile.id
          }

          CanddtSocialAuth.isSocialAccount(userProfile.social_id, appConstants.LINKEDIN).then(function (account) {

            if (!account) {

              //create user account
              auth.createAccount(userData, { params: { role: appConstants.EMPLOYEE_ROLE } }, res, socialAccount).then(function () {
                //successfully conneted linkedin account
              }).catch(function (error) {
                console.log("not connecting...");
                res.json(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_LINKEDIN_ACCOUNT, error, httpStatus.VALIDATION_ERROR))
              })
            } else {
              console.log("account no================", account);
              res.json(responseHandler.errorResponse(messageHandler.ERROR_LINKEDIN_ACCOUNT_ALREADY_EXISTS, {}, httpStatus.VALIDATION_ERROR))
            }

          }).catch(function (error) {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_LINKEDIN_ACCOUNT, error, httpStatus.VALIDATION_ERROR))
          });


        });
      }, 5000);

    }).catch(function (error) {
      res.json(responseHandler.errorResponse("sdasdfas", error, httpStatus.VALIDATION_ERROR))
    });
  },

  base64Encode: (file) => {
    // read binary data
    var bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64')
  },

  linkedInCompanySignup: (req, res, next) => {
    let companyUser = req.body;
    LinkedinAPI.getCompanyProfile(companyUser.linkedin_company_id, companyUser.linkedin_access_token).then(function (companyProfile) {
      let companyAccount = Object.assign({}, companyUser, companyProfile)
      console.log("user data for company", companyProfile)
      var companyLogo = null;
      if (companyProfile.logoUrl) {
        companyLogo = companyProfile.logoUrl
      } else {
        //default company logo
        companyLogo = "http://www.morrell-middleton.co.uk/wp-content/uploads/logo-placeholder.jpg";
      }
      //fetch remote image as base64
      request(
        {
          url: companyLogo,
          encoding: 'binary'
        }
        , function (e, r, b) {
          var type = r.headers["content-type"];
          var size = r.headers["content-length"];
          var base64 = new Buffer(b, 'binary').toString('base64');
          //save company profile object with base64 image
          //console.log("Account ********", companyAccount, "Company address", companyAccount.locations.values[0]);
          var location = (companyAccount.locations && companyAccount.locations.values[0])?companyAccount.locations.values[0]:"";
          var addressStreet = (location && location.address && location.address.street1)?location.address.street1 + ",":"";
          var addresspostalCode = (location && location.address && location.address.postalCode)?location.address.postalCode + ",":"";
          var addressCity = (location && location.address && location.address.city)?location.address.city:"";
          let userData = {
            "email": companyAccount.email,
            "name": (companyAccount.name)?companyAccount.name:"",
            "description": (companyAccount.description)?companyAccount.description:"",
            "address1": addressStreet + addresspostalCode + addressCity,
            "linkedin_page": "www.linkedin.com/" + companyAccount.universalName,
            "domain_name": (companyAccount.websiteUrl) ? companyAccount.websiteUrl : "",
            "password": "dummy123",
            file: {
              "size": size,
              "mime_type": type,
              "original_name": "logo.png",
              "base64": base64
            }
          }

          let socialAccount = {
            strategy_type: "linkedin", //need to move to constant
            access_token: companyUser.linkedin_access_token,
            social_id: companyUser.social_id
          }

          //check if already exists
          CanddtSocialAuth.isSocialAccount(companyUser.social_id, appConstants.LINKEDIN).then(function (account) {

            if (!account) {

              //create user account
              auth.createAccount(userData, { params: { role: appConstants.COMPANY_ROLE } }, res, socialAccount).then(function () {
                //successfully conneted linkedin account
              }).catch(function (error) {
                console.log("not connecting...");
                res.json(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_LINKEDIN_ACCOUNT, error, httpStatus.VALIDATION_ERROR))
              })
            } else {
              console.log("account no================", account);
              res.json(responseHandler.errorResponse(messageHandler.ERROR_LINKEDIN_ACCOUNT_ALREADY_EXISTS, {}, httpStatus.VALIDATION_ERROR))
            }

          }).catch(function (error) {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_LINKEDIN_ACCOUNT, error, httpStatus.VALIDATION_ERROR))
          });
        }
      );
    }).catch(function (error) {
      res.json(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_LINKEDIN_ACCOUNT, error, httpStatus.VALIDATION_ERROR))
    });
  },

  linkedInCompanySignin: (req, res, next) => {
    LinkedinAPI.getAccessToken(req.body.code, req.body.redirect_uri).then(function (accessToken) {
      console.log("token****", accessToken)
      setTimeout(function () {
        request(helpers.postOptions('auth/linkedin/getUserProfile', accessToken), function (err, resp) {
          let userProfile = resp.body
          console.log("userProfile****", userProfile)
          CanddtSocialAuth.socialLogin(userProfile.id, appConstants.LINKEDIN).then(function (data) {
            console.log("data response", data)
            var user = data.user
            /**
             * @todo: Need to refactor token logic as generic
             *
             */
            jwtexpiresIn = jwtConfig.jwtexpiresIn
            momentExpiresTimeCount = jwtConfig.momentExpires.timeCount
            var token = jwt.sign({ user_id: user.id, email: user.email }, jwtOptions.secretOrKey, { expiresIn: jwtexpiresIn })
            var userToken = {}
            tokenManager.isExist(user.id, req.body).then((row) => {
              tokenManager.invalidateToken(user.id, req.body, row).then((done) => {
                userToken = {
                  token: token,
                  // currently we are not sending below three values in req
                  fcm_token: (req.body.fcm_token) ? req.body.fcm_token : '',
                  device_type: (req.body.device_type) ? req.body.device_type : '',
                  device_id: (req.body.device_id) ? req.body.device_id : '',
                  user_id: user.id,
                  expired_at: moment().add(momentExpiresTimeCount, jwtConfig.momentExpires.unit),
                  valid: 1,
                }

                tokenManager.insertUpdateToken(userToken).then((tokenResult) => {
                  if (tokenResult) {
                    //console.log('insertUpdateToken result', tokenResult)
                    generatedData = responseHandler.generateAuthResponse(user, userToken)
                    res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_LOGIN, generatedData, httpStatus.SUCCESS));

                  }
                })
              })
            })

          }).catch(function (error) {
            console.log("error", error)
            res.json(error);
          });

        });
      }, 5000);
    }).catch(function (error) {
      res.json(error);
    });
  },

  checkAccVarif: (req, res) => {
    var userId = req.params.userId
    models.users.findById(userId).then(user => {
      if (user.dataValues.is_verified) {
        res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_USER_VERIFIED, user, httpStatus.SUCCESS))
      }
      else {
        console.log("else run")
        res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_VERIFIED, {}))
      }
    }).catch(err => {
      console.log("checkAccountVarif err", err)
      responseHandler.errorResponse(messageHandler.BAD_REQUEST, {})
    })
  },

  socialSignup: (req, res) => {
    console.log("req.bod", req.body)
    let body = req.body;
    let userData = {
      "dob": "",
      "email": body.email,
      "country_of_residence": 1,
      "first_name": body.first_name,
      "last_name": body.last_name,
      "phone_number": "",
      "previous_company": "",
      "year_of_experience": "",
      "password": "test@123"
    }

    let socialAccount = {
      strategy_type: req.body.type,
      access_token: body.access_token,
      social_id: body.social_id
    }
    console.log("socialAccount ===========", socialAccount)
    // var 
    //check if already exists
    CanddtSocialAuth.isSocialAccount(body.social_id, req.body.type).then(function (account) {
      if (!account) {
        //create user account
        auth.createAccount(userData, { params: { role: appConstants.EMPLOYEE_ROLE } }, res, socialAccount).then(function () {
          //successfully conneted linkedin account
        }).catch(function (error) {
          console.log("not connecting...");
          res.json(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_SOCIAL_ACCOUNT, error, httpStatus.VALIDATION_ERROR))
        })
      } else { //if account is already exist call social signin api to connect user's account
        var option = {
          method: "POST",
          url: `${endpoints.API}/socialSignin`,
          json: body
        }

        request(option, function (err, resp) {
          if (err) {
            console.log("step3 request err", err)
            res.json(responseHandler.errorResponse({}, err))
          }
          else {
            res.json(resp.body)
          }
        })
      }
    }).catch(function (error) {
      res.json(responseHandler.errorResponse(messageHandler.ERROR_CONNECTING_SOCIAL_ACCOUNT, error, httpStatus.VALIDATION_ERROR))
    });
  },



  socialSignin: (req, res) => {
    var body = req.body;
    CanddtSocialAuth.socialLogin(body.social_id, body.type).then(function (data) {
      console.log("data response", data)
      var user = data.user
      /**
       * @todo: Need to refactor token logic as generic
       *
       */
      jwtexpiresIn = jwtConfig.jwtexpiresIn
      momentExpiresTimeCount = jwtConfig.momentExpires.timeCount
      var token = jwt.sign({ user_id: user.id, email: user.email }, jwtOptions.secretOrKey, { expiresIn: jwtexpiresIn })
      var userToken = {}
      tokenManager.isExist(user.id, req.body).then((row) => {
        tokenManager.invalidateToken(user.id, req.body, row).then((done) => {
          userToken = {
            token: token,
            // currently we are not sending below three values in req
            fcm_token: (req.body.fcm_token) ? req.body.fcm_token : '',
            device_type: (req.body.device_type) ? req.body.device_type : '',
            device_id: (req.body.device_id) ? req.body.device_id : '',
            user_id: user.id,
            expired_at: moment().add(momentExpiresTimeCount, jwtConfig.momentExpires.unit),
            valid: 1,
          }

          tokenManager.insertUpdateToken(userToken).then((tokenResult) => {
            if (tokenResult) {
              //console.log('insertUpdateToken result', tokenResult)
              generatedData = responseHandler.generateAuthResponse(user, userToken)
              res.json(responseHandler.successResponse(messageHandler.SUCCESS_AUTH_LOGIN, generatedData, httpStatus.SUCCESS));
            }
          })
        })
      })

    }).catch(function (error) {
      console.log("error", error)
      res.json(error);
    });
  }
}

module.exports = auth
