
  const fs = require('fs')
  const path = require('path')
  const crypto = require('crypto')
  var mkdirp = require('mkdirp');

  var Promise = require('promise')

  var fileUploader = {
    /// get base64 encoded string convert into image
    /// save to directory
    // and return image related details
    saveFile: (str, destinationPath, type, fileType) => {
      return new Promise(function (resolve, reject) {

        console.log("type *******", type, fileType );
        if (typeof str !== 'undefined') {
          //check mine type and return extension
          var imgExtention = fileUploader.getExtension(type,fileType);
          // Generate random string
          var seed = crypto.randomBytes(20)
          var uniqueSHA1String = crypto.createHash('sha1').update(seed).digest('hex')
          var imageBuffer = new Buffer(str, 'base64')
          //var userUploadedLocation = destinationPath
          var publicPath = './public/' + destinationPath
          var uniqueRandomImageName = 'file-' + uniqueSHA1String
          var imageExtension = imgExtention
          var userUploadedImagePathPublic = publicPath + uniqueRandomImageName + imageExtension
          var userUploadedImagePath =  destinationPath + uniqueRandomImageName + imageExtension

        // Save decoded binary image to disk
        //console.log("test *********************",imgExtention,  imageExtension, publicPath,userUploadedImagePathPublic )
         //fileUploader.mkdirpath(publicPath)
         var finalPath = userUploadedImagePathPublic
        // console.log("test path", filePath,userUploadedImagePathPublic )
          mkdirp(publicPath, function (err) {
            if (err){ console.error(err)

            }else{
              fs.writeFile(finalPath, imageBuffer,
                (err) => {
                  if (err) {
                    console.log('Not uploaded!')
                    reject(err)
                  } else {
                    console.log('uploaded:', finalPath)
                    const stats = fs.statSync(finalPath)
                    const fileSizeInBytes = stats.size
                    response = {
                      'file_name': uniqueRandomImageName,
                      'file_extension': imageExtension,
                      'mime_type': type,
                      'file_path': userUploadedImagePath,
                      'file_size': fileSizeInBytes,
                      'success': 1
                    }
                    resolve(response)
                  }
                })
            }

          });
          
        } else {
          resolve(str)
        }
      })
    },
    uploadLogo: ()=>{
      //put logic validation rule here for logo upload
      //dir structure
    },
    uploadResume: ()=>{
      //put logic validation rule here for logo upload
      //dir structure
    },

    getExtension: (mimeType, fileType)=>{
      
      var mimeTypesArray = [];
      if(fileType==="logo"){
        mimeTypesArray = {
          'image/gif' : '.gif',
          'image/jpeg' : '.jpeg',
          //'image/jpeg' : '.jpg',
          'image/png' : '.png'
        }
      }else if(fileType==="resume"){
        mimeTypesArray = {
          'text/csv' : '.csv',
          'application/msword' : '.doc',
          'application/pdf' : '.pdf',
          'application/vnd.ms-powerpoint' : '.ppt',
          'application/vnd.ms-excel' : '.xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : '.xlsx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : '.docx',
        }
      }else if(fileType==="file"){
        mimeTypesArray = {
          'text/csv' : '.csv',
        }
      }
      
      var extensionVal = null;
      if(mimeTypesArray[mimeType]){
        extensionVal = mimeTypesArray[mimeType]
      }
      return extensionVal;
    }

  }

  module.exports = fileUploader
