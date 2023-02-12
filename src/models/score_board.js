const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Scoreboard extends Model {
  
  }

  Scoreboard.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    run: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    batsman: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    wicket: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    over: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },

  }, {
    sequelize,
    modelName: 'Scoreboard',
    tableName: 'score_board'
  })
  return Scoreboard;
}
