var models = require('../models/index')
var messageHandler = require('../lib/messageHandler')
var responseHandler = require('../lib/response-handler')
var httpStatus = require('../config/status-codes')
var appConstants = require('../config/constants')
var sequelize = require('sequelize')
var fileUpload = require('../lib/file-upload')
var fileConstants = require('../config/file')

var site = {

  getHomePageInfo: function (req, res) {
    models.settings.findAll()
      .then(result => {
        res.json(responseHandler.successResponse({}, result, httpStatus.SUCCESS))
      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
      })
  },

  saveHomePageInfo: function (req, res) {
    var authUser = null;
    if (res.userDecodedToken && res.userDecodedToken.auth) {
      authUser = res.userDecodedToken.auth
    }
    var userData = req.body;
    if(userData && Object.keys(userData.banner_image).length===0) {
        models.settings.update({
          page: userData.page,
          title: userData.title,
          description: userData.description
        }, {
            where: {
              id: userData.id
            },
            validate: false
        }).then((update) => {

            models.settings.findAll()
            .then(result => {
              console.log("testtttt****", result);
              res.json(responseHandler.successResponse({}, result, httpStatus.SUCCESS))
            }).catch(function (error) {
              res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
            })

        }).catch((error) => {
            res.json(responseHandler.errorResponse("home page info update error", error, httpStatus.VALIDATION_ERROR));
        })

    }else if (userData && userData.banner_image) {
      var isExtensionValid = fileUpload.getExtension(userData.banner_image.mime_type, fileConstants.LOGO_CONTENT_TYPE);
      if (!isExtensionValid) {
        res.json(responseHandler.errorResponse(messageHandler.ERROR_NOT_VALID_FILE_EXTENSION, {}, httpStatus.VALIDATION_ERROR));
      }
    

        fileFolderPath = fileConstants.FILE_SYSTEM + fileConstants.HOMEPAGE_DIR;
        
        fileUpload.saveFile(userData.banner_image.base64, fileFolderPath , userData.banner_image.mime_type, fileConstants.LOGO_CONTENT_TYPE).then(function(data){
            
            models.settings.update({
              page: userData.page,
              title: userData.title,
              description: userData.description,
              banner_url: data.file_path,
            }, {
                where: {
                  id: userData.id
                },
                validate: false
            }).then((update) => {
                  models.settings.findAll()
                  .then(result => {
                    res.json(responseHandler.successResponse({}, result, httpStatus.SUCCESS))
                  }).catch(function (error) {
                    res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
                  })
            }).catch((error) => {
                res.json(responseHandler.errorResponse("home page info update error", error, httpStatus.VALIDATION_ERROR));
            })

        }).catch((error) => {
          res.json(responseHandler.errorResponse("Banner uplad error", error, httpStatus.VALIDATION_ERROR));
        })
    }
  },

  getCountries: function (req, res) {
    models.countries.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] })
      .then(states => {
        res.json(responseHandler.successResponse({}, states, httpStatus.SUCCESS))
      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
      })
  },


  getCities: function (req, res) {
    var id = req.params.id

    models.cities.findAll({ where: { 'country_id': id }, attributes: ['id', 'name'], order: [['name', 'ASC']] })
      .then(function (cities) {
        res.json(responseHandler.successResponse({}, cities, httpStatus.SUCCESS))
      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
      })
  },


  addCity: function (req, res) {
    models.cities.create(req.body).then(result => {
      res.json(responseHandler.successResponse({}, result, httpStatus.SUCCESS))
    }).catch(error => {
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR))
    })
  }

}

module.exports = site
