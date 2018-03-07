module.exports = {
  local: {
    WEB: 'http://localhost:6075',
    API: 'http://localhost:3000',
    JOB_API: 'http://localhost:3001'
  },
  development: {
    WEB: 'https://dev.canddt.com',
    API: 'https://dev.canddt.com/Server/user_registration',
    JOB_API: 'https://dev.canddt.com/Server/job_application'
  },
  staging: {
    WEB: 'https://staging.canddt.com',
    API: 'https://staging.canddt.com/Server/user_registration',
    JOB_API: 'https://staging.canddt.com/Server/job_application'

  },
   production: {
    WEB: 'https://canddt.com',
    API: 'https://canddt.com/Server/user_registration',
    JOB_API: 'https://canddt.com/Server/job_application'
  }
};
