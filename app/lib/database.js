// config/database.js
var Sequelize = require('sequelize')
const sequelize = new Sequelize('gic_user_registration', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }

})

sequelize
   .authenticate()
   .then(() => {
     console.log('Connection has been established successfully.')
   })
   .catch(err => {
     console.error('Unable to connect to the database:', err)
   })

module.exports = sequelize
