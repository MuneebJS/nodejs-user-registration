'use strict'
module.exports = function (sequelize, DataTypes) {
  var UserRole = sequelize.define('user_roles', {
    user_id: DataTypes.INTEGER,
    role_id: DataTypes.INTEGER
  }, {
    primaryKey: false,
    createdAt: false,
    updatedAt: false

  })

  UserRole.associate = function (models) {
    // associations can be defined here
    UserRole.belongsTo(models.users, {foreignKey: 'user_id'})
    //UserRole.belongsTo(models.roles, {foreignKey: 'role_id'})
  }

  return UserRole
}
