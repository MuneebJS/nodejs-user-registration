'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    var sequelize = queryInterface.sequelize;
    return sequelize.transaction(function (t) {
      var migrations = [];
      migrations.push(queryInterface.addColumn(
        'cover_letters',
        'created_at',
        Sequelize.DATE,
        { transaction: t }
      ));

      migrations.push(queryInterface.addColumn(
        'cover_letters',
        'updated_at',
        Sequelize.DATE,
        { transaction: t }
      ));


      return Promise.all(migrations);
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
