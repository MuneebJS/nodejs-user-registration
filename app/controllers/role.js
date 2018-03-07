var models = require('../models/index')
var messageHandler = require('../lib/messageHandler')
var responseHandler = require('../lib/response-handler')
var httpStatus = require('../config/status-codes')
var appConstants = require('../config/constants')
var sequelize = require('sequelize')

var role = {

  roles: function (req, res) {
    statesData = models.roles.findAll({attributes: ['id', 'name'], order: [['name', 'ASC']]}).then(states => {
      res.json(responseHandler.successResponse({}, states, httpStatus.SUCCESS))
    })
  }
  
}

module.exports = role
