'use strict'
module.exports = function (sequelize, DataTypes) {
  var Resumes = sequelize.define('resumes', {
    title: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    file_id: DataTypes.INTEGER,
    //cover_letter: DataTypes.TEXT,
    primary: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at:DataTypes.DATE
  }, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  Resumes.associate = function (models) {
    Resumes.belongsTo(models.users, {foreignKey: 'user_id'})
    Resumes.belongsTo(models.files, {foreignKey: 'file_id'})
    Resumes.hasOne(models.cover_letters, {foreignKey: 'resume_id'})
  }

  return Resumes
}
