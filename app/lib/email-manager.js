var helper = require('sendgrid').mail
var sendGridKeys = require('../config/sendgrid')
var env = process.env.NODE_ENV || 'development'
var endpoints = require('../config/endpoints')[env]
var appConstants = require('../config/constants')

var emailManager = {
  userActivation: (activateCode) => {
    var fromEmail = new helper.Email(appConstants.EmailInfo)
    var toEmail = new helper.Email('shakeeb@nextgeni.com')
    var subject = 'Please activate your account'
    var emailBody = 'Please activate your account by following url. www.gic.com/activate/' + activateCode
    var content = new helper.Content('text/plain', emailBody)
    var mail = new helper.Mail(fromEmail, subject, toEmail, content)
    console.log('API keys', sendGridKeys.SENDGRID_API_KEY)
    var sg = require('sendgrid')(sendGridKeys.SENDGRID_API_KEY)
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    })

    return sg.API(request)
  },
  
  forgetPassword: (activateCode, email) => {
    var fromEmail = new helper.Email(appConstants.EmailInfo)
    var toEmail = new helper.Email(email)
    var subject = 'We have reset your password'
    var emailBody = 'Please reset your password by following url. ' + endpoints.WEB + '/forgetPassword/' + activateCode
    var content = new helper.Content('text/plain', emailBody)
    var mail = new helper.Mail(fromEmail, subject, toEmail, content)
    console.log('API keys', sendGridKeys.SENDGRID_API_KEY)
    var sg = require('sendgrid')(sendGridKeys.SENDGRID_API_KEY)
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    })

    return sg.API(request)
  },


  accountVerify: (activateCode, email) => {
    var fromEmail = new helper.Email(appConstants.EmailInfo)
    var toEmail = new helper.Email(email)
    var subject = 'We have job account verify'
    var emailBody = 'Please verify your account by following url. ' + endpoints.WEB + '/accountVerify/' + activateCode + '/' + email
    var content = new helper.Content('text/plain', emailBody)
    var mail = new helper.Mail(fromEmail, subject, toEmail, content)
    console.log('API keys', sendGridKeys.SENDGRID_API_KEY)
    var sg = require('sendgrid')(sendGridKeys.SENDGRID_API_KEY)
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    })

    return sg.API(request)
  },

  accountSignup: (name, email) => {
    var fromEmail = new helper.Email(appConstants.EmailInfo)
    var toEmail = new helper.Email(email)
    var subject = 'Welcome to Canddt!'
    var emailBody = 'Welcome to Canddt! You can login to your account now.'
    var content = new helper.Content('text/plain', emailBody)
    var mail = new helper.Mail(fromEmail, subject, toEmail, content)
    var sg = require('sendgrid')(sendGridKeys.SENDGRID_API_KEY)
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    })

    return sg.API(request)
  },

  /*
  This function is reponsible to send email using sendgrid template
  templateData sample
  var templateData = {
    template_id :sendgrid.TEMPLATE_SIGNUP_AND_INVITE,//config based template it provided by sendgrid
    subject     :" ",//set it blank space if setted on sendgrid template else provide here
    email_to    : test@test.com,//recipient email address
    //substitute use to set dynamic data
    //set on sendgrid template e.g; %first_name%
    substitutes :
    {
    first_name   : first_name,
    last_name    : last_name,
  }
  }
  */
  sendEmailUsingTemplate: (templateData) => {
    console.log('email data', templateData)
    return new Promise(function (resolve, reject) {
      mail = new helper.Mail()
      email = new helper.Email(sendGridKeys.FROM_EMAIL, sendGridKeys.FROM_NAME)
      mail.setFrom(email)
      mail.setSubject(templateData.subject)
      personalization = new helper.Personalization()
      email = new helper.Email(templateData.email_to)
      personalization.addTo(email)
      personalization.setSubject(templateData.subject)
      Object.keys(templateData.substitutes).forEach(function (i) {
        console.log(i)
        console.log(templateData.substitutes[i])
        substitution = new helper.Substitution('%' + i + '%', templateData.substitutes[i])
        personalization.addSubstitution(substitution)
      })
      mail.addPersonalization(personalization)
      mail.setTemplateId(templateData.template_id)
      var sg = require('sendgrid')(sendGridKeys.SENDGRID_API_KEY)
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
      })

      sg.API(request, function (error, response) {
        if (error === null) {
          console.log('email sent')
          resolve(response)
        } else {
          console.log('email not sent')
          reject(error)
        }
      })
    })
  }
}

module.exports = emailManager
