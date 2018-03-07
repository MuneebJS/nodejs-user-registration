
MessageHandler = {

  /// //***********************************//////
  /// //******* Site messages/text **********//////
  /// //***********************************//////
  EMAIL_SUBJECT: 'Welcome onboard!! ',
  EMAIL_SUBJECT_NOTIFICATION: 'Session Notification!! ',

  /// //***********************************//////
  /// //******* SUCCESS MESSAGES **********//////
  /// //***********************************//////
  /* recommended name convention SUCCESS+"message identifier" */
  SUCCESS_AUTH_USER_CREATED: 'User created successfully!!!',
  SUCCESS_AUTH_PROFILE_UPDATED: 'Profile updated successfully!!!',
  SUCCESS_AUTH_CHECK_TOKEN: 'Your given token is valid !!!',
  SUCCESS_AUTH_LOGOUT: 'User has been logout',
  SUCCESS_AUTH_LOGIN: 'User has login successfully',
  SUCCESS_AUTH_USER_ACTIVATED: 'User has been successfully activated',
  SUCCESS_AUTH_USER_DEACTIVATED: 'User has been successfully deactivated',
  SUCCESS_AUTH_INVITATION_SENT: 'Parent has been successfully invited',
  SUCCESS_AUTH_USER_ACTIVATION_EMAIL: 'Activation email has been sent to your inbox',
  SUCCESS_AUTH_USER_FORGET_PASSWORD: 'Your password has been reset and link is sent to your inbox',
  SUCCESS_AUTH_USER_PASSWORD_CHANGED: 'Your password has been changed successfully',
  SUCCESS_AUTH_INVITAION_ACCEPTED: 'Invitation Accepted',
  SUCCESS_AUTH_USER_VERIFIED: 'Auth user is verified',
  SUCCESS_PERMISSION: 'You Have Permission',
  SUCCESS_AUTH_VERIFY_SECRET_QUESTION: 'Your password verification has been successfully done',
  GET_PROFILE_BY_ID_SUCCESS: "Profile taken successfully",
  SUCCESS_TOKEN_REFRESHED: 'Token updated successfully',
  SUCCESS_LIST_ALL_LINKEDIN_COMPANIES: 'Fetch linkinedin compaines successfully',
  SUCCESS_LINKEDIN_ACCOUNT: "Your linkedin acccount has been connected",
  SUCCESS_FACEBOOK_ACCOUNT: "Your facebook acccount has been connected",
  /// //***********************************//////
  /// //******* SUCCESS MESSAGES **********//////
  /// //***********************************//////

  /// //***********************************//////
  /// //********* ERROR MESSAGES **********//////
  /// //***********************************//////
  /* recommended name convention ERROR+"message identifier" */
  ERROR_FACEBOOK_ACCOUNT_ALREADY_EXISTS: "Your facebook account already exists",
  ERROR_LINKEDIN_ACCOUNT_COMPANY_NOTFOUND: "We unable to find any company associate with this account",
  ERROR_NOT_VALID_FILE_EXTENSION: 'This is not valid file extension',
  ERROR_AUTH_USER_NOT_FOUND: 'User not found',
  ERROR_AUTH_USER_ACTIVATION_CODE_EXPIRED: 'Given user activation code has been expired',
  ERROR_AUTH_COMPANY_NOT_FOUND: 'Company profile not found',
  ERROR_AUTH_USER_SIGNUP_VALIDATION: 'Something went wront with signup process',
  ERROR_AUTH_USER_ALREADY_EXIST: 'User is already exists',
  ERROR_AUTH_DOMAIN_ALREADY_EXIST: 'Domain name is already exists',
  ERROR_AUTH_USER_TOKEN_EXPIRED: 'Given user token has been expired',
  ERROR_AUTH_PROFILE_NOT_UPDATED: 'Profile not updated successfully',
  ERROR_AUTH_USER_ACTIVATION_CODE: 'Unable to activate user',
  ERROR_AUTH_USER_DEACTIVATION_CODE: 'Unable to deactivate user',
  ERROR_AUTH_USER_PASSWORD: 'Your password doesnot match',

  ERROR_AUTH_USER_ACTIVATION_EMAIL: 'Due to technical reason we are unable to send email',
  ERROR_AUTH_USER_FORGET_PASSWORD: 'Due to technical reason we unable to send you link',
  ERROR_AUTH_USER_PASSWORD_CHANGED: 'Your old password does not match',
  ERROR_AUTH_INVALID_INVITATION_TOKEN: 'Invalid token',
  ERROR_AUTH_INVITATION_NOT_SENT: 'Invitation not send successfully',
  ERROR_AUTH_PROFILE_UPDATED: 'Unable to update your profile',
  ERROR__PERMISSION: "You Don't Have Permission",
  ERROR_AUTH_USER_NOT_EXISTS_INACTIVE_ACCOUNT: 'This email address is not exists',
  ERROR_AUTH_INVITATION_TOKEN_EXPIRED: 'Given invitation token has been expired',

  ERROR_ROW_NOT_FOUND: 'No Row Found',

  ERROR_AUTH_ANSWER_ONE: 'Answer one does not match.',
  ERROR_AUTH_ANSWER_TWO: 'Answer two does not match.',
  ERROR_AUTH_PROFILE_PREFERRED_METHOD: 'Preferred method cannot be empty',
  ERROR_AUTH_USER_VERIFIED: "Auth user is not verified",



  ERROR_ADD_PROFILE_IMAGE: 'Profile image cannnot be empty',
  /// //***********************************//////
  ERROR__ROLE: 'Role not be able to assigned',

  ERROR_LIST_ALL_LINKEDIN_COMPANIES: 'Unable to fetch linkinedin compaines',
  ERROR_CONNECTING_SOCIAL_ACCOUNT: "Error in connecting linkedin account",


  ERROR_NOT_VALID_PARENT: 'Not a valid parent',
  ERROR_NOT_A_VALID_COACH: 'Not a valid coach',

  /// //********* ERROR MESSAGES **********//////
  /// //***********************************//////

  /////***************Account Verify messages********************//////
  SUCCESS_VERIFY_COMPANY_ACCOUNT: 'Succefully verified account for job, please login and post your job!!!',
  SUCCESS_VERIFY_COMPANY_ACCOUNT_WITH_JOB_PUBLISH: 'Succefully verified account for job and your job has published successfully!!!',
  ERROR_EMAIL_CONFIRM: 'New email and confirm email doesnot matched',
  ERROR_OLD_EMAIL_NOT_MATCHED: 'Old email doesnot matched',
  ERROR_CODE_EXPIRED: 'YOUR CODE IS EXPIRED',
  ERROR_JOB_PUBLISH_API: 'Error in job publish api',
  /////**********************************************************//////

}

module.exports = MessageHandler
