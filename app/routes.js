// app/routes.js
var express = require('express')
var moment = require('moment')
var router = express.Router()
var passport = require('passport')
var passportJWT = require('passport-jwt')
var strategies = require('./lib/passport')
var jwtConfig = require('./config/jwt-config')
var jwt = require('jsonwebtoken')
var ExtractJwt = passportJWT.ExtractJwt
var JwtStrategy = passportJWT.Strategy
var model = require('./models/index')
var authCtrl = require('./controllers/auth.js') // Auth controller
var roleCtrl = require('./controllers/role.js') // Roles controller
var siteCtrl = require('./controllers/site.js') // Common site controller
var profileCtrl = require('./controllers/profile.js') // Profile controller
var tokenManager = require('./lib/token-manager')
var httpStatus = require('./config/status-codes') // htp status code
var responseHandler = require('./lib/response-handler')
var messageHandler = require('./lib/messageHandler')
var expressValidator = require('express-validator')
var validator = require('validator')
var Acl = require('./lib/acl')
var aclMiddleware = require('./middleware/acl-middleware')
var jwtMiddleware = require('./middleware/jwt-middleware');
var LinkedinTokenStrategy = require('passport-linkedin-token-oauth2');
var request = require('request');
var endpoints = require('./config/endpoints')
var helpers = require('./lib/helper')
var adminCtrl = require('./controllers/admin-ctrl')


module.exports = function (app) {
  app.use(express.static('public'))
  passport.use('local-login', strategies.getLocalStartegy())
  passport.use('facebook-token', strategies.getFbStartegy())
  passport.use('linkedin-token', strategies.getLinkedinStartegy())


  app.use(passport.initialize())
  var jwtOptions = {}
  jwtOptions.jwtFromRequest = ExtractJwt.fromHeader('x-auth-token')
  jwtOptions.secretOrKey = jwtConfig.jwtSecret
  app.use(expressValidator({
    customValidators: {
      isArray: function (value) {
        return Array.isArray(value)
      },
      gte: function (param, num) {
        return param >= num
      }
    }
  }))



  router.get('/', function (req, res, next) {
    res.json({ message: 'App run successfully!' })
  })

  router.post('/signup/:role', authCtrl.signup);

  router.post('/signin', authCtrl.signin);

  router.get('/getRoles', roleCtrl.roles);

  router.get('/getHomePageInfo', siteCtrl.getHomePageInfo);

  router.post('/saveHomePageInfo', siteCtrl.saveHomePageInfo);

  router.get('/getCountries', siteCtrl.getCountries);

  router.get('/getCities/:id', siteCtrl.getCities);

  router.post('/addCity', siteCtrl.addCity);

  router.get('/checkAuth', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, (req, res) => {
    res.json(responseHandler.successResponse({}, res.userDecodedToken, httpStatus.SUCCESS));
  })


  // router.post('/auth/facebook/token', authCtrl.fbSignup)

  // app.post('/auth/linkedin/token', authCtrl.linkedinSignup)

  router.post('/auth/linkedin/getUserProfile', authCtrl.getUserProfile)

  router.post('/linkedin/access_token', authCtrl.listAllLinkedinCompanies)

  router.post('/linkedin/access_token/employee', authCtrl.linkedInEmployeeAccessTokenAndSignup)

  router.post('/linkedin/company/signup', authCtrl.linkedInCompanySignup)

  //router.post('/linkedin/employee/signup', authCtrl.linkedInEmployeeSignup)

  router.post('/linkedin/company/signin', authCtrl.linkedInCompanySignin)

  router.post('/profile/create/:role', profileCtrl.saveProfile);

  router.post('/user/upload/resume', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, profileCtrl.saveResume);

  router.post('/fileUpload', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, profileCtrl.fileUpload);

  router.get('/user/getResumes', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, profileCtrl.getResume);

  router.get('/getCandidateProfileInfo/:employeeId', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, profileCtrl.getCandidateProfileInfo);

  router.post('/profile/update/:role/:id', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, profileCtrl.saveProfile);

  router.get('/profile/:role/:id', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, profileCtrl.getProfile)

  router.post('/getCompanyProfiles', profileCtrl.getCompanyProfiles)

  router.post('/getUserProfiles', profileCtrl.getUserProfiles)

  router.get('/logout', authCtrl.logout)

  router.get('/checkAccVerif/:userId', authCtrl.checkAccVarif)

  router.post('/changePassword', (req, res, next) => {
    jwtMiddleware.validateJWT(req, res, next, jwtOptions)
  }, authCtrl.changePassword)

  router.post('/forgetPassword/:code?', authCtrl.forgotPassword)

  router.post('/accountVerify/:code?', authCtrl.accountVerify)

  router.post('/socialSignup', authCtrl.socialSignup)

  router.post('/socialSignin', authCtrl.socialSignin)


  //=============== Admin APIs ==============================

  router.get('/admin/getUsers/:page', (req, res, next) => {
    var allowRoles = ['admin'];
    jwtMiddleware.validateJWT(req, res, next, jwtOptions, allowRoles)
  }, adminCtrl.getUsers)

  router.post('/admin/updateUser', (req, res, next) => {
    var allowRoles = ['admin'];
    jwtMiddleware.validateJWT(req, res, next, jwtOptions, allowRoles)
  }, adminCtrl.updateUser)

  router.get('/admin/user/:user_id/:action', (req, res, next) => {
    var allowRoles = ['admin'];
    jwtMiddleware.validateJWT(req, res, next, jwtOptions, allowRoles)
  }, adminCtrl.activateUser)


  //======== End Admin APIs ================================

  return router
}
