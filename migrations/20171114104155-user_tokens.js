'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('user_tokens', { 
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' }
        },
        token:{
          type: Sequelize.STRING
        },
        expired_at:{
          type: Sequelize.DATE,
          allowNull: false,
        },
        created_at:{
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at:{
          type: Sequelize.DATE
        },
        device_type:{
          type: Sequelize.STRING
        },
        device_id:{
          type: Sequelize.STRING
        },
        valid:{
          type: Sequelize.INTEGER,
          allowNull: false
        }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('user_tokens');
  }
};
