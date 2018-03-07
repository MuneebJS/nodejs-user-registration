'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('files', { 
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name:{
          type: Sequelize.STRING
        },
        size:{
          type: Sequelize.STRING
        },
        mime_type:{
          type: Sequelize.STRING
        },
        origional_name:{
          type: Sequelize.STRING
        },
        path:{
          type: Sequelize.STRING
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' }
        },
        created_at:{
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at:{
          type: Sequelize.DATE
        }, 
        content_type:{
          type: Sequelize.STRING,
          allowNull: false
        }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('files');
  }
};
