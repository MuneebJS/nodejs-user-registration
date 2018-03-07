'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('user_social_accounts', { 
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          strategy_type:{
            type: Sequelize.STRING,
            allowNull: false,
          },
          access_token:{
            type: Sequelize.STRING,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.INTEGER,
            references: { model: 'users', key: 'id' }
          }
       });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('user_social_accounts');
  }
};
