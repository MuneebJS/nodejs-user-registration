'use strict'
module.exports = function (sequelize, DataTypes) {
  var Profiles = sequelize.define('profile', {
    user_id: DataTypes.INTEGER,
    dob: DataTypes.DATE,
    country_of_residence: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false

  })

  Profiles.associate = function (models) {
    // associations can be defined here
    Profiles.belongsTo(models.users, {foreignKey: 'user_id'})
  }

  return Profiles
}
