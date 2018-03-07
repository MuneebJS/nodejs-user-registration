'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('settings', { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      page:{
        type: Sequelize.STRING
      },
      title:{
        type: Sequelize.TEXT
      },
      description:{
        type: Sequelize.TEXT
      },
      banner_url:{
        type: Sequelize.STRING
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('settings');
  }
};
