'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('users', { 
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email:{
          type: Sequelize.STRING
        },
        password:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        activation_code:{
          type: Sequelize.STRING
        },
        is_verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        verified_email:{
          type: Sequelize.STRING
        },
        status: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
        },
        address1:{
          type: Sequelize.STRING
        },
        address2:{
          type: Sequelize.STRING
        },
        zipcode: {
          type: Sequelize.INTEGER,
        },
        ext_zipcode: {
          type: Sequelize.INTEGER,
        },
        first_name:{
          type: Sequelize.STRING
        },
        last_name:{
          type: Sequelize.STRING
        },
        phone_number:{
          type: Sequelize.STRING
        },
        created_at:{
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at:{
          type: Sequelize.DATE
        },
      });
    
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
