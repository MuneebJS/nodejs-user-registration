'use strict'
module.exports = function (sequelize, DataTypes) {
  var States = sequelize.define('states', {
    name: DataTypes.STRING,
    country_id: DataTypes.INTEGER,
  }, {
    createdAt: false,
    updatedAt: false
  })

  States.associate = function (models) {
    
  }

  return States
}
