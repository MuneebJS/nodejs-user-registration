'use strict'
module.exports = function (sequelize, DataTypes) {
  var Settings = sequelize.define('settings', {
    page: DataTypes.STRING,
    title: DataTypes.TEXT,
    description: DataTypes.TEXT,
    banner_url: DataTypes.STRING
  }, {
    createdAt: false,
    updatedAt: false
  })

  return Settings
}
