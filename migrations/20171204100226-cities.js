'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state_id: {
        type: Sequelize.INTEGER,
        references: { model: 'states', key: 'id' }
      },
      country_id: {
        type: Sequelize.INTEGER,
        references: { model: 'countries', key: 'id' }
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cities');
  }
};
