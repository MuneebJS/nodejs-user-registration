'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    var sequelize = queryInterface.sequelize;
    return sequelize.transaction(function (t) {
      var migrations = [];
      migrations.push(queryInterface.addColumn(
        'users',
        'year_of_experience',
        Sequelize.STRING,
        { transaction: t }
      ));

      migrations.push(queryInterface.addColumn(
        'users',
        'previous_company',
        Sequelize.STRING,
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
