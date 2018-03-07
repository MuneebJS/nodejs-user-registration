'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    var sequelize = queryInterface.sequelize;
    return sequelize.transaction(function (t) {
      var migrations = [];
      migrations.push(queryInterface.addColumn(
        'user_social_accounts',
        'created_at',
        Sequelize.DATE,
        { transaction: t }
      ));

      migrations.push(queryInterface.addColumn(
        'user_social_accounts',
        'updated_at',
        Sequelize.DATE,
        { transaction: t }
      ));

      return Promise.all(migrations);
    });
  },

  down: (queryInterface, Sequelize) => {

  }
};
