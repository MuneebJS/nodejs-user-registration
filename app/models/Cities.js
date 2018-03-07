'use strict'
module.exports = function (sequelize, DataTypes) {
  var Cities = sequelize.define('cities', {
    name: DataTypes.STRING,
    state_id: DataTypes.INTEGER,
    country_id: DataTypes.INTEGER
  }, {
    createdAt: false,
    updatedAt: false
  })

  Cities.associate = function (models) {
    Cities.belongsTo(models.countries, {foreignKey: 'country_id'})
  }

  return Cities
}
