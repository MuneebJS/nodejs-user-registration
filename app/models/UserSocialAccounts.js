'use strict'
module.exports = function (sequelize, DataTypes) {
  var UserSocialAccounts = sequelize.define('user_social_accounts', {
    user_id: DataTypes.INTEGER,
    strategy_type: DataTypes.STRING,
    access_token: DataTypes.STRING,
    social_id: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }, {
      timestamps: false
    })

  UserSocialAccounts.associate = function (models) {
    // associations can be defined here
    UserSocialAccounts.belongsTo(models.users, { foreignKey: 'user_id' })
  }
  return UserSocialAccounts
}
