'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('resumes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title:{
          type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      file_id:{
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' }
      },
      cover_letter:{
        type: Sequelize.TEXT
      },
      primary:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at:{
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at:{
        type: Sequelize.DATE
      },
    });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('resumes');

  }
};
