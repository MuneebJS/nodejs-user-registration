'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cover_letters', { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cover_letter:{
        type: Sequelize.TEXT
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      resume_id: {
        type: Sequelize.INTEGER,
        references: { model: 'resumes', key: 'id' }
      },
      employee_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cover_letters');
  }
};
