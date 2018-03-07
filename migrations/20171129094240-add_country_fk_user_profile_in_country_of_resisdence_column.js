'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE profile ADD FOREIGN KEY (`country_of_residence`) REFERENCES countries(`id`);'
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE `profile` DROP FOREIGN KEY `profile_ibfk_2`;'
    );
  }
};
