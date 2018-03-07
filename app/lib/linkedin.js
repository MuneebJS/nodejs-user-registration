var socialAuth = require('../config/social-auth')
var request = require('request')
var messageHandler = require('./messageHandler')
var LinkedinAPI = {
  getAccessToken:(code,redirect_uri)=>{

    return new Promise(function (resolve, reject) {
      let accessTokenUrl = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}&client_id=${socialAuth.linkedinAuth.consumerKey}&client_secret=${socialAuth.linkedinAuth.consumerSecret}`;
      console.log("access url",accessTokenUrl);
      request(accessTokenUrl, function (error, response, body) {
        if(!error){
          var bodyResponse = JSON.parse(body)
          if(bodyResponse && bodyResponse.error){
                reject(bodyResponse.error);
          }else{
            var accessToken = bodyResponse.access_token
            resolve(accessToken);
          }

        }else{
          console.log("login error",error);
          reject(error);
        }
      });
    });

  },
  getCompanyList:(accessToken)=>{
    return new Promise(function (resolve, reject) {
      let compListUrl = `https://api.linkedin.com/v1/companies?oauth2_access_token=${accessToken}&format=json&is-company-admin=true`
      request(compListUrl, function (error, response, body) {
        if(!error){
          let companyList = JSON.parse(body)
          console.log("=== Company List ===", companyList);
          if(companyList._total) resolve(companyList)
          else reject({error: messageHandler.ERROR_LINKEDIN_ACCOUNT_COMPANY_NOTFOUND});
        }else{
            reject(error);
        }
      })
    });
  },
  getUserProfile:()=>{},
  getCompanyProfile:(id,accesstoken)=>{
    return new Promise(function (resolve, reject) {
      let companyProfileURL = `https://api.linkedin.com/v1/companies/${id}:(id,name,ticker,description,universal-name,website-url,logo-url,locations)?oauth2_access_token=${accesstoken}&format=json`
      request(companyProfileURL, function (error, response, body) {
        if(!error){
          let companyProfile = JSON.parse(body)
          resolve(companyProfile)
        }else{
            reject(error)
        }
      })
    });
  }
}
module.exports = LinkedinAPI
