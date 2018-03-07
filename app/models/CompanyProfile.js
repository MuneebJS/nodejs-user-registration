'use strict'
module.exports = function (sequelize, DataTypes) {
  var CompanyProfile = sequelize.define('company_profile', {
    user_id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    file_id: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    address1: DataTypes.STRING,
    linkedin_page: DataTypes.STRING,
    facebook_page: DataTypes.STRING,
    domain_name: DataTypes.STRING
  }, {
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    })

  CompanyProfile.associate = function (models) {
    // associations can be defined here
    CompanyProfile.belongsTo(models.users, { foreignKey: 'user_id' })
    CompanyProfile.belongsTo(models.files, { foreignKey: 'file_id' })
  }
  return CompanyProfile
}
