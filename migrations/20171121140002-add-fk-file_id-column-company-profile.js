'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE company_profile ADD FOREIGN KEY (`file_id`) REFERENCES files(`id`);'
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE `company_profile` DROP FOREIGN KEY `company_profile_ibfk_2`;'
    );
  }
};
