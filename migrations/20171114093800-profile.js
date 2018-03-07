'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('profile', { 
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        dob: {
          type: Sequelize.DATE
        },
        country_of_residence: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' }
        }
    });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('profile');
  }
};
