'use strict'
module.exports = function (sequelize, DataTypes) {
  var CoverLetters = sequelize.define('cover_letters', {
    employee_id: DataTypes.INTEGER,
    job_id: DataTypes.INTEGER,
    cover_letter: DataTypes.TEXT,
    resume_id: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  CoverLetters.associate = function (models) {
    CoverLetters.belongsTo(models.users, {foreignKey: 'employee_id'})
    CoverLetters.belongsTo(models.resumes, {foreignKey: 'resume_id'})
  }

  return CoverLetters
}
