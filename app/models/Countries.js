'use strict'
module.exports = function (sequelize, DataTypes) {
  var Roles = sequelize.define('countries', {
    name: DataTypes.STRING
  }, {
    createdAt: false,
    updatedAt: false
  })

  Roles.associate = function (models) {
    //Roles.belongsToMany(models.users, { through: { model: models.user_roles}, foreignKey: 'role_id' })
  }

  return Roles
}
