'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
        'ALTER TABLE `company_profile` CHANGE  `logo` `file_id` INTEGER;'
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE `company_profile` CHANGE  `file_id` `logo` VARCHAR(255);'
    );
  }
};
