'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('company_profile', { 

        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        name:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        logo:{
          type: Sequelize.STRING
        },
        description:{
          type: Sequelize.TEXT
        },
        address1:{
          type: Sequelize.STRING
        },
        user_id: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' }
        },
        linkedin_page:{
          type: Sequelize.STRING
        },
        facebook_page:{
          type: Sequelize.STRING
        }, 
        domain_name:{
          type: Sequelize.STRING,
          allowNull: false
        }

      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('company_profile');
  }
};
