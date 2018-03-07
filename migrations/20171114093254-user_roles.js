'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_roles', {
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      role_id: {
        type: Sequelize.INTEGER,
        references: { model: 'roles', key: 'id' }
      }
    });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('user_roles');
  }
};
