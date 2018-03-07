var models = require('../models/index')
var messageHandler = require('../lib/messageHandler')
var responseHandler = require('../lib/response-handler')
var httpStatus = require('../config/status-codes')
var constants = require('../config/constants')
var fileConstants = require('../config/file')
var sequelize = require('sequelize')
var validation = require('../validations/profile.js')
var utility = require('../lib/utility')
var fileUpload = require('../lib/file-upload')
var request = require('request')
var env = process.env.NODE_ENV || 'development'
var endpoints = require('../config/endpoints')[env]

var profile = {

  fileUpload: function (req, res) {
    var authUser = null;
    if (res.userDecodedToken && res.userDecodedToken.auth) {
      authUser = res.userDecodedToken.auth
    }
    var userData = req.body;
    if (userData && userData.file) {
      var isExtensionValid = fileUpload.getExtension(userData.file.mime_type, fileConstants.FILE_CONTENT_TYPE);
      if (!isExtensionValid) {
        res.json(responseHandler.errorResponse(messageHandler.ERROR_NOT_VALID_FILE_EXTENSION, {}, httpStatus.VALIDATION_ERROR));
      }
    }

    fileFolderPath = fileConstants.FILE_SYSTEM + fileConstants.FILE_DIR + authUser.user_id + "/";
    userData.user_id = authUser.user_id;
    models.files.save(userData, fileFolderPath, fileConstants.FILE_CONTENT_TYPE).then(function (fileResult) {
      res.json(responseHandler.successResponse("File upload successfully", fileResult, httpStatus.SUCCESS));
    }).catch(function (error) {
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
    })

  },

  saveResume: function (req, res) {
    var authUser = null;
    var coverLetterResult = null;
    var resumeResult = null;

    if (res.userDecodedToken && res.userDecodedToken.auth) {
      authUser = res.userDecodedToken.auth
    }
    var userData = req.body;

    if (userData && userData.file) {
      var isExtensionValid = fileUpload.getExtension(userData.file.mime_type, fileConstants.RESUME_CONTENT_TYPE);
      if (!isExtensionValid) {
        res.json(responseHandler.errorResponse(messageHandler.ERROR_NOT_VALID_FILE_EXTENSION, {}, httpStatus.VALIDATION_ERROR));
      }
    }

    if (userData && userData.file) {
      fileFolderPath = fileConstants.FILE_SYSTEM + fileConstants.RESUME_DIR + authUser.user_id + "/";
      userData.user_id = authUser.user_id;
      models.files.save(userData, fileFolderPath, fileConstants.RESUME_CONTENT_TYPE).then(function (fileResult) {
        //create resume row in db

        models.resumes.update({
          primary: 0
        }, {
          where: { user_id: authUser.user_id }
          }).then(function (update) {

            var resumeObj = {
              "title": userData.title,
              "user_id": authUser.user_id,
              "primary": 1,
              "file_id": fileResult.id
            }
            models.resumes.create(resumeObj).then(function (resumeResult) {

              var coverLetterResult = {};
              if (userData && userData.job_id) {
                var coverLetterObj = {
                  "employee_id": authUser.user_id,
                  "cover_letter": (userData.cover_letter) ? userData.cover_letter : "",
                  "resume_id": (resumeResult && resumeResult.id) ? resumeResult.id : userData.resume_id,
                  "job_id": userData.job_id,
                }
                models.cover_letters.create(coverLetterObj).then(function (coverLetterResult) {
                  var finalResult = {
                    resumeResult,
                    coverLetterResult,
                  }

                  res.json(responseHandler.successResponse("Success", finalResult, httpStatus.SUCCESS));

                }).catch(function (error) {
                  res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
                })
              } else {

                var finalResult = {
                  resumeResult,
                  coverLetterResult,
                }

                res.json(responseHandler.successResponse("Success", finalResult, httpStatus.SUCCESS));
              }

            }).catch(function (error) {
              res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
            })

          }).catch(function (error) {
            res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
          })


      })
    } else if (userData && userData.cover_letter) {
      var coverLetterObj = {
        "employee_id": authUser.user_id,
        "cover_letter": userData.cover_letter,
        "resume_id": (resumeResult && resumeResult.id) ? resumeResult.id : userData.resume_id,
        "job_id": userData.job_id,
      }
      models.cover_letters.create(coverLetterObj).then(function (coverLetterResult) {
        var finalResult = {
          resumeResult,
          coverLetterResult,
        }

        res.json(responseHandler.successResponse("Success", finalResult, httpStatus.SUCCESS));

      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      })

    } else {
      var coverLetterObj = {
        "employee_id": authUser.user_id,
        "cover_letter": "",
        "resume_id": (resumeResult && resumeResult.id) ? resumeResult.id : userData.resume_id,
        "job_id": userData.job_id,
      }
      models.cover_letters.create(coverLetterObj).then(function (coverLetterResult) {
        var finalResult = {
          resumeResult,
          coverLetterResult,
        }

        res.json(responseHandler.successResponse("Success", finalResult, httpStatus.SUCCESS));

      }).catch(function (error) {
        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      })
    }


  },

  getResume: function (req, res) {
    var authUser = null;
    var token = req.body.token || req.query.token || req.headers['x-auth-token'];

    if (res.userDecodedToken && res.userDecodedToken.auth) {
      authUser = res.userDecodedToken.auth
    }

    models.resumes.findAll(
      {
        where: { user_id: authUser.user_id, primary: 1 },
        include: [
          { model: models.files },
          { model: models.cover_letters, order: [['id', 'ASC']]}, 
        ]
      }
    ).then(function (result) {
      //console.log("result", result[result.length - 1]);
      if (result[0].cover_letter) {
        var coverLetterData = result[result.length - 1];
        var jobId = coverLetterData.cover_letter.job_id;
        //console.log("job id****", jobId);
        request.get(
          {
            url: `${endpoints.JOB_API}/getJobData/${jobId}`,
            json: true,
            headers: {
              'X-Auth-Token': token,
            }
          },
          function (error, jobResult, object) {
            //console.log("jobResult", jobResult)
            if (error) {
              res.json(responseHandler.errorResponse(messageHandler.ERROR_JOB_PUBLISH_API, error, httpStatus.VALIDATION_ERROR));
            }
            else if (jobResult) {
              if (jobResult.body.error === null) {
                result[0].title = jobResult.body.data.title;
                res.json(responseHandler.successResponse("success", result, httpStatus.SUCCESS));
              }
              else if (jobResult.body.error == true && jobResult.body.error !== null) {
                res.json(responseHandler.errorResponse(messageHandler.ERROR_JOB_PUBLISH_API, jobResult.body.message, httpStatus.VALIDATION_ERROR));
              }
            }
          })

      } else {
        result[0].title = null;
        res.json(responseHandler.successResponse("success", result, httpStatus.SUCCESS));
      }


    }).catch(function (error) {
      console.log("error", error);
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
    });

  },

  saveProfile: function (req, res) {
    var userType = req.params.role
    var authUser = null;
    if (res.userDecodedToken && res.userDecodedToken.auth) {
      authUser = res.userDecodedToken.auth
    }

    //console.log("decoded yser", user.data.auth.user_id);
    var id = req.params.id
    var userData = req.body;
    switch (userType) {
      case "company":
        validation.validateCompanyProfileInfo(req, res).then(() => {
          //function for save company profile
          utility.saveCompanyProfile(id, userData, authUser, res);

        }).catch(function (error) {
          console.log("test", error);
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
        });

        break;
      case constants.EMPLOYEE_ROLE:
        validation.validateUserProfileInfo(req, res).then(() => {
          //function for save user profile
          utility.saveUserProfile(id, userData, authUser, res);
        }).catch(function (error) {
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
        });
        break;
    }

  },

  getProfile: function (req, res) {
    var userType = req.params.role;
    var authUser = res.userDecodedToken.auth
    var id = req.params.id;
    switch (userType) {
      case "company":
        statesData = models.company_profile.findAll(
          {
            where: { id: id, user_id: authUser.user_id }, order: [['name', 'ASC']],
            include: [{
              model: models.files
              //attributes:['id', 'path']
            }]
          }
        ).then(states => {
          if (states != "") {
            res.json(responseHandler.successResponse({}, states, httpStatus.SUCCESS))
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_COMPANY_NOT_FOUND, {}, httpStatus.VALIDATION_ERROR));
          }
        }).catch(function (error) {
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
        });
        break;
      case constants.EMPLOYEE_ROLE:
        statesData = models.profile.findAll({ where: { id: id, user_id: authUser.user_id }, order: [['id', 'ASC']] }).then(states => {
          if (states != "") {
            res.json(responseHandler.successResponse({}, states, httpStatus.SUCCESS))
          } else {
            res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_USER_NOT_FOUND, {}, httpStatus.VALIDATION_ERROR));
          }

        }).catch(function (error) {
          res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
        });
        break;
    }

  },

  getCompanyProfiles: function (req, res) {
    var data = req.body;

    //console.log("fsdds*****", data.companyProfileIdArray);
    companyProfileData = models.company_profile.findAll(
      {
        where: { id: data.companyProfileIdArray },attributes:['id', 'name', 'email', 'description', 'address1', 'linkedin_page','facebook_page'],
        include: [{
          model: models.files,
          attributes:['id', 'path']
        }]
      }
    ).then(companyProfileData => {
      if (companyProfileData != "") {
        res.json(responseHandler.successResponse({}, companyProfileData, httpStatus.SUCCESS))
      } else {
        res.json(responseHandler.errorResponse(messageHandler.ERROR_AUTH_COMPANY_NOT_FOUND, {}, httpStatus.VALIDATION_ERROR));
      }
    }).catch(function (error) {
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
    });

  },

  getUserProfiles: function (req, res) {
    var data = req.body;

    models.profile.findAll({
      where: { user_id: data.userProfileIdArray }
    }).then(function (profilesResult) {


      var userIdArray = [];
      profilesResult.forEach(function (value, key) {
        userIdArray.push(value.user_id);
      });

      models.users.findAll({
        where: { id: userIdArray }, attributes: ['id', 'email', 'first_name', 'last_name', 'year_of_experience', 'previous_company'],
        include: [
          { model: models.resumes, where: { primary: 1 } },
          { model: models.files }
        ]
      }).then(function (userResult) {

        var resultArray = [];
        userResult.forEach(function (value, key) {

          if (value.resume.file_id == value.file.id) {
            resultArray.push(value);
          }
        });

        res.json(responseHandler.successResponse({}, resultArray, httpStatus.SUCCESS))

      }).catch(function (error) {

        res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });

    }).catch(function (error) {
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
    });

  },

  getCandidateProfileInfo: function (req, res) {
    var data = req.body;
    var employeeId = req.params.employeeId;

    models.users.findOne({
      where: { id: employeeId }, attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number', 'year_of_experience', 'previous_company'],
      include: [
        { model: models.resumes, where: { primary: 1 } },
        { model: models.files }
      ]
    }).then(function (result) {
      var candidateProfileResult = {
        candidateInfo: {
          id: result.id,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          year_of_experience: result.year_of_experience,
          previous_company: result.previous_company
        },
        resume: result.resume,
        file: result.file,
      }

      res.json(responseHandler.successResponse({}, candidateProfileResult, httpStatus.SUCCESS))
    }).catch(function (error) {
      res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
    });
  },

}

module.exports = profile
