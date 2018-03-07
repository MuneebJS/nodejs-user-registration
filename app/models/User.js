// model/User.js
var bcrypt = require('bcrypt-nodejs')
var models = require('../models/index')

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('users', {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: { msg: 'Invalid email address' }
        //  isNotNull: { msg: "The email is required" }
      }
    },
    password: {
      type: DataTypes.STRING
    },
    activation_code: {
      type: DataTypes.STRING
    },
    is_verified: {
      type: DataTypes.BOOLEAN
    },
    verified_email: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.INTEGER
    },
    address1: {
      type: DataTypes.STRING
    },
    address2: {
      type: DataTypes.STRING
    },
    zipcode: {
      type: DataTypes.INTEGER
    },
    ext_zipcode: {
      type: DataTypes.INTEGER
    },
    first_name: {
      type: DataTypes.STRING
    },
    last_name: {
      type: DataTypes.STRING
    },
    phone_number: {
      type: DataTypes.STRING
    },
    year_of_experience: {
      type: DataTypes.STRING
    },
    previous_company: {
      type: DataTypes.STRING
    },
    created_at: {
      type: DataTypes.DATE
    },
    updated_at: {
      type: DataTypes.DATE
    }
  }, {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    })

  User.associate = function (models) {
    User.belongsToMany(models.roles, { through: { model: models.user_roles}, foreignKey: 'user_id' })
    // User.belongsTo(models.company_profile, { foreignKey: 'user_id' })
    User.hasOne(models.company_profile, { foreignKey: 'user_id'})
    User.hasOne(models.profile, { foreignKey: 'user_id'})
    User.hasOne(models.resumes, { foreignKey: 'user_id' })
    User.hasOne(models.files, { foreignKey: 'user_id' })
  }

  User.getPasswordHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
  }

  User.matchPassword = (password, storePassword) => {
    console.log("pass:", password, "store:", storePassword);
    try {
      return bcrypt.compareSync(password, storePassword)
    } catch (err) {
      return false
    }
  }
  return User
}
