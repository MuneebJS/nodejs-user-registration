var request = require('request');
var env = process.env.NODE_ENV || 'development';
var endpoints = require('../config/endpoints')[env];


var userRegistration = {
  getProfiles: (token, postarr) => {
    return new Promise(function (resolve, reject) {
      request.post({
        url: endpoints.API + 'getProfiles',
        json: true,
        body: postarr,
        headers: {
          'X-Auth-Token': token,
          'content-type': 'application/json'
        }
      }, function (error, response, body) {

        if (error)
          reject(error);
        else {
          resolve(body);
        }

      });

    });
  }


};

module.exports = userRegistration
