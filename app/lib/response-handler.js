// API response handler to manage resposne object
var responseHandler = {
  successResponse: function (message, data, code) {
    return {
      error: null,
      message: message,
      data: data,
      code: code || 200
    }
  },
  errorResponse: function (message, data, code) {
    return {
      error: true,
      message: message,
      data: data,
      code: code || 99
    }
  },
  permissionErrorResponse: function (message, data, code) {
    return {
      error: true,
      message: message,
      data: data,
      code: code || 90
    }
  },
  generateAuthResponse: function (user,tokenResult) {
    return {
      token: (tokenResult.token) ? tokenResult.token : null,
      // currently we are not sending below three values in req
      fcm_token: (tokenResult.fcm_token) ? tokenResult.fcm_token : null,
      device_type: (tokenResult.device_type) ? tokenResult.device_typ : null,
      device_id: (tokenResult.device_id) ? tokenResult.device_id : null,
      user_id: (user.id) ? user.id : null,
      expired_at: (tokenResult.expired_at) ? tokenResult.expired_at : null,
      valid: (tokenResult.valid) ? tokenResult.valid : null,
      email: (user.email) ? user.email : null,
      activation_code: (user.activation_code) ? user.activation_code : null,
      is_verified: (user.is_verified) ? user.is_verified : null,
      verified_email: (user.verified_email) ? user.verified_email : null,
      status: (user.status) ? user.status : null,
      address1: (user.address1) ? user.address1 : null,
      address2: (user.address2) ? user.address2 : null,
      zipcode: (user.zipcode) ? user.zipcode : null,
      previous_company: (user.previous_company) ? user.previous_company : null,
      ext_zipcode: (user.ext_zipcode) ? user.ext_zipcode : null,
      first_name: (user.first_name) ? user.first_name : null,
      last_name: (user.last_name) ? user.last_name : null,
      phone_number: (user.phone_number) ? user.phone_number : null,
      created_at: (user.created_at) ? user.created_at : null,
      updated_at: (user.updated_at) ? user.updated_at : null,
      role: (user.roles) ? user.roles : null,
      profileData: (user.profile) ? user.profile : null
    }
  }
}
module.exports = responseHandler
