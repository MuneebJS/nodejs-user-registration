
var passportJWT = require('passport-jwt')
var jwt = require('jsonwebtoken')
var Promise = require('promise')
var tokenManager = require('./token-manager')
var responseHandler = require('./response-handler')
var httpStatus = require('../config/status-codes')
var messageHandler = require('./messageHandler')
var appConstants = require('../config/constants')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token')
var userRoles = require('../lib/user-roles');
// var LinkedInTokenStrategy = require('passport-linkedin-token').Strategy;
var LinkedinTokenStrategy = require('passport-linkedin-token-oauth2').Strategy;
var configSocialAuth = require('../config/social-auth')
var auth = require('../controllers/auth')
var utility = require('../lib/utility')
var JwtStrategy = passportJWT.Strategy
var models = require('../models/index')
var moment = require('moment')
var jwtConfig = require('../config/jwt-config')

var ExtractJwt = passportJWT.ExtractJwt
var JwtStrategy = passportJWT.Strategy

var strategies = {
  getLocalStartegy: () => {
    // console.log("getLocalStartegy");
    return new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
      (req, email, password, done) => { // callback with email and password from our form
        console.log('logging email', email, password)
        models.users.findOne({
          where: {
            email: email
          },
          include: [{
            model: models.roles,
            attributes: ['id', 'name']
          }],
        }).then(user => {
          // console.log('user fetch', user)
          if (!user) return done(null, false, messageHandler.ERROR_AUTH_USER_NOT_EXISTS_INACTIVE_ACCOUNT)
          if (models.users.matchPassword(password, user.password)) {
            console.log("password matched!!!", user.roles[0].dataValues.name);
            if (user.roles[0].dataValues.name === appConstants.COMPANY_ROLE) {
              //query from company profile
              models.company_profile.findOne({
                where: { user_id: user.id },
                include: {
                  model: models.files
                }
              }).then((result) => {

                user.profile = result
                return done(null, user)
              })
            } else if (user.roles[0].dataValues.name === appConstants.EMPLOYEE_ROLE) {
              //query from profile table
              models.profile.findOne({
                where: { user_id: user.id }
              }).then((result) => {

                user.profile = result
                return done(null, user)
              })
            } else {
              // admin user 
              return done(null, user)
            }

          } else {
            return done(null, false, messageHandler.ERROR_AUTH_USER_PASSWORD)
          }
        })
      })
  },

  getJWTValidate: (jwtOptions, req) => {
    return new Promise((fulfill, reject) => {
      try {
        var token = req.headers['x-auth-token']
        // console.log("tokennnnn", token);

        var decoded = jwt.verify(token, jwtOptions.secretOrKey)
        //  console.log('headers/decoded', req.headers['x-auth-token'], decoded)
        if (decoded) {
          console.log('decoded', decoded)
          tokenManager.isValid(decoded, token, req.body).then((result) => {
            console.log("token result console", result)

            statesData = models.users.findOne(
              {
                attributes: ['email'],
                where: { id: result.user_id },
                include: [{
                  model: models.roles,
                  attributes: ['id', 'name']
                }]
              }
            ).then(states => {
              var finalResult = {
                auth: result,
                user: states
              }
              fulfill(finalResult)
            }).catch(function (error) {
              reject(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
            });

          })
            .catch((error) => reject(error)) // pass req.body for extra params
        } else {
          reject(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_TOKEN_EXPIRED, {}, httpStatus.INVALID_TOKEN))
        }
      } catch (error) {
        reject(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_TOKEN_EXPIRED, {}, httpStatus.INVALID_TOKEN))
      }
    })
  },


  manageSocialAccount: (strategyType, profileId, userId, accessToken, done, roleType, jwtToken) => {
    // console.log("manage social")
    // console.log("manage socila accout arg jwttoken", jwtToken)
    return new Promise((resolve, reject) => {
      models.user_social_accounts.findAll({
        where: {
          strategy_type: strategyType,
          social_id: profileId
        }
      }).then(function (socialUser, err) {
        // if user exist
        if (socialUser.length > 0) {
          utility.getSocialProfile(userId, roleType).then((result) => {
            //query user model and include profile table

            finalObject = {
              email: result[0].dataValues.email,
              first_name: result[0].dataValues.first_name,
              last_name: result[0].dataValues.last_name,
              token: jwtToken,
              user_id: result[0].dataValues.id,
              role: result[0].roles,
              user: result[0].dataValues,
            }
            console.log("final obj user exist", result)
            // resolve(finalObject)
            done(null, finalObject, "linked login successfull")
          }).catch((error) => {

            reject(error)
          })
        }
        // if user doesn't not exist
        else {
          console.log("social user doesn't exist")
          models.user_social_accounts.create({
            // user_id: user[0].dataValues.id,
            user_id: userId,
            strategy_type: strategyType,
            access_token: accessToken,
            social_id: profileId
          }).then((result) => {

            utility.getSocialProfile(userId, roleType).then((result) => {
              // console.log("pura user profile utha lia not existing", result);

              finalObject = {
                // token: jwtToken,
                // user_id: result[0].dataValues.id,
                // role: result[0].roles,
                // profileData: result[0].profile,
                // user: result[0].dataValues

                email: result[0].dataValues.email,
                first_name: result[0].dataValues.first_name,
                last_name: result[0].dataValues.last_name,
                token: jwtToken,
                user_id: result[0].dataValues.id,
                role: result[0].roles,
                user: result[0].dataValues,
              }
              // console.log("before resolved existing user result", result);
              console.log("final obj fresh user result", result[0])
              done(null, finalObject, "linkedin login successfull on existing user case")
              resolve(finalObject)
            }).catch((error) => {
              reject(error)
            })
          }).catch((error) => {
            reject(error);
          });


        }
      }).catch(function (error) {
        // console.log("check social user status error", error)
        done(true, error, "linked login error occured")
        reject(error)

      })
    });
  },


  addSocialUser(socialUser, done, roleType) {

    console.log("Role typeeeeeeeeeeeeeee==============", roleType)
    return new Promise((resolve, reject) => {

      models.users.findAll({
        where: {
          email: socialUser.email
        }
      }).then(function (user) {
        const socialUserData = {
          email: socialUser.email,
          first_name: socialUser.firstName,
          last_name: socialUser.lastName
        }

        var message = null

        if (user.length > 0) {
          console.log("user exist in our database")

          // create jwt token

          var momentExpiresTimeCount = appConstants.MOMENT_EXPIRES_TIME_COUNT
          var userId = user[0].dataValues.id // extract user id from local db

          // generate jwt token
          var token = utility.getJwtToken(userId, socialUser.email)
          var userTokenData = {
            'token': token,
            'expired_at': moment().add(momentExpiresTimeCount, jwtConfig.momentExpires.unit),
            'valid': appConstants.TOKEN_VALID,
            'user_id': user[0].dataValues.id // extract user id from local db
          }

          tokenManager.isExist(userId).then((row) => {
            tokenManager.invalidateToken(userId, null, row).then(() => {
              userToken = {
                token: token,
                // currently we are not sending below three values in req
                // fcm_token: (req.body.fcm_token) ? req.body.fcm_token : '',
                // device_type: (req.body.device_type) ? req.body.device_type : '',
                // device_id: (req.body.device_id) ? req.body.device_id : '',
                user_id: userId,
                expired_at: moment().add(momentExpiresTimeCount, jwtConfig.momentExpires.unit),
                valid: 1,
                // role: user.roles,
                profileData: socialUserData,
                // user: user
              }

              tokenManager.insertUpdateToken(userToken).then((result) => {
                if (result) {
                  console.log('insertUpdateToken result', result)
                  strategies.manageSocialAccount(
                    socialUser.type,
                    socialUser.socialId, // socialUser id
                    user[0].dataValues.id, // extract user id from local db
                    socialUser.accessToken,
                    done,       // callback from passport
                    roleType,   //role type whether company or employee
                    token       //jwt token

                  ).then(function (result) {
                    // console.log("manage social response", result);
                    resolve(result)
                  }).catch((error) => {
                    console.log(error)
                    reject(error);
                  });



                  //  res.json(userToken)
                }
              })
            })
          })

          models.user_tokens.create(userTokenData).then(tokenResult => {

            // create an account in user_social_accounts table
            strategies.manageSocialAccount(
              socialUser.type,
              socialUser.socialId, // socialUser id
              user[0].dataValues.id, // extract user id from local db
              socialUser.accessToken,
              done,       // callback from passport
              roleType,   //role type whether company or employee
              token       //jwt token

            ).then(function (result) {
              // console.log("manage social response", result);
              resolve(result)
            }).catch((error) => {
              console.log(error)
              reject(error);
            });

          })

            .catch(error => {
              console.log("token creation error")
              reject(error)
            })


        } else {
          console.log("user doesn't exist in our database")


          models.users.create(socialUserData)
            .then(function (result) {
              var userId = result.id
              var socialProfileData = {
                email: socialUserData.email,
                name: `${socialUserData.first_name} ${socialUserData.last_name}`,
                user_id: userId
              }
              // create profile base on rolet type
              utility.createSocialProfile(roleType, socialProfileData).then((result2) => {
                var momentExpiresTimeCount = appConstants.MOMENT_EXPIRES_TIME_COUNT
                // generate jwt token
                var token = utility.getJwtToken(userId, result.email)
                var userTokenData = {
                  'token': token,
                  'expired_at': moment().add(momentExpiresTimeCount, jwtConfig.momentExpires.unit),
                  'valid': appConstants.TOKEN_VALID,
                  'user_id': userId
                }

                userRoles.saveUserRole(userId, roleType).then(function (userRole) {
                  // add token in table
                  models.user_tokens.create(userTokenData)
                    .then(function (result) {
                      //    console.log('insert in user tokens success', result)
                      // create an account in user_social_accounts table
                      strategies.manageSocialAccount(
                        socialUser.type,
                        socialUser.socialId,  // socialUser id
                        userId, // extract user id
                        socialUser.accessToken,
                        done,  // callback from passport
                        roleType,
                        token
                      ).then((result) => {
                        //Add entry into company profile

                        // console.log("result sfsdfsdfsd", result)
                        resolve(result)
                      }).catch((error) => {
                        console.log(error)
                        reject(error);
                      })
                    })
                }).catch((error) => {
                  console.log(error)
                  reject(error);
                })

              })
                .catch(error => {
                  console.log("create social profile error", error)
                  reject(error)
                })



              // .catch(function (error) {
              //   console.log('insert in user tokens error', error)
              //   reject(error);
              // })


              //company profile
            })

            .catch(function (error) {
              console.log("models.user.create error", error)
              reject(error);
            })
        }
      })

    })
  },



  getFbStartegy: () => {
    return new FacebookTokenStrategy({
      clientID: configSocialAuth.facebookAuth.clientID,
      clientSecret: configSocialAuth.facebookAuth.clientSecret

    }, function (accessToken, refreshToken, profile, done) {

      //Make dynamic for employee/company

      // var fbUserEmail = profile.emails[0].value
      let fbUserData = {
        email: profile.emails[0].value,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        social_id: profile.id
      }
      // done(null, fbUserData, "get fb user data successuflly")

      strategies.addSocialUser({
        email: fbUserEmail,
        socialId: profile.id,
        accessToken: accessToken,
        type: 'facebook',
        firstName: profile.name.givenName,
        lastName: profile.name.familyName
      }, done, appConstants.EMPLOYEE_ROLE).then((result) => {
        //  console.log("getFbStartegy success", result)
        done(null, result, "fblogin complete")
      }).catch((error) => done(error))
    })
  },


  getLinkedinStartegy: () => {
    console.log("getLinkedinStartegy")
    return new LinkedinTokenStrategy({
      clientID: configSocialAuth.linkedinAuth.consumerKey,
      clientSecret: configSocialAuth.linkedinAuth.consumerSecret
    }, function (accessToken, refreshToken, profile, done) {
      console.log("accesstoken", accessToken)
      console.log("refreshToken", refreshToken)
      console.log("profile", profile)
      // console.log("profile", profile)
      done(null, profile, "linkedin login success")
    }
    )
  }
}

module.exports = strategies
