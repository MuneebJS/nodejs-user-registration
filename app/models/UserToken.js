'use strict'
module.exports = function (sequelize, DataTypes) {
  var UserToken = sequelize.define('user_tokens', {
    user_id: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    expired_at: DataTypes.DATE,
    valid: DataTypes.INTEGER,
    token: DataTypes.STRING,
    //fcm_token: DataTypes.TEXT,
    device_type: DataTypes.STRING,
    device_id: DataTypes.STRING,
    updated_at: DataTypes.DATE
  }, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    classMethods: {
      // associate: function(models) {
      //   // associations can be defined here
      // }
    }
  })

  UserToken.associate = function (models) {
    // associations can be defined here
    UserToken.belongsTo(models.users, {foreignKey: 'user_id'})
  }
  return UserToken
}
