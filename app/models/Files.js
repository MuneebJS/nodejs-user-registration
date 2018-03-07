'use strict'

var fileUpload = require('../lib/file-upload')
var fileConstants = require('../config/file')

module.exports = function (sequelize, DataTypes) {
  var Files = sequelize.define('files', {
    user_id: DataTypes.INTEGER,
    name:DataTypes.STRING,
    size:DataTypes.STRING,
    mime_type:DataTypes.STRING,
    origional_name:DataTypes.STRING,
    path:DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    content_type:DataTypes.STRING
  }, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  Files.associate = function (models) {
    // associations can be defined here
    Files.belongsTo(models.users, {foreignKey: 'user_id'})
  }

  // File.getLogo = function(company_id){
  //     //return logo url 
  // }

  // File.getResume = function(){
  //   //return resume docs url
  // }
  Files.save = function (userData,fileFolderPath, fileContentType) {
   
    return new Promise(function (resolve, reject) {
      console.log("testt  ****** **************", userData, fileFolderPath, fileContentType);
    
      fileUpload.saveFile(userData.file.base64, fileFolderPath , userData.file.mime_type, fileContentType).then(function(data){
       
          var fileData = {
            "origional_name": userData.file.original_name,
            "name": data.file_name,
            "size": data.file_size,
            "mime_type": data.mime_type,
            "path": data.file_path,
            "user_id": userData.user_id,
            "content_type":fileContentType
          }
          Files.create(fileData).then(function(fileResult){
            resolve(fileResult);
            
          }).catch(function(error){
            reject(error)
            //res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
          });  
      }).catch(function(error){
        reject(error)
        //res.json(responseHandler.errorResponse({}, error, httpStatus.VALIDATION_ERROR));
      });
    });

  }
  // File.saveResume = function(user_id,fid){
  //   //Return promise which indicate record save/error
  //   //save resume into table
  // }


  return Files
}
