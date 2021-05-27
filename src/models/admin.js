const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class admin extends Model {
  }
  admin.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING(50),
    email: {
      type: DataTypes.STRING(150),
      unique: true
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    password: DataTypes.STRING(100),
    reset_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    code_expiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }

  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admin',
    indexes: [
      {
        unique: false,
        fields: ['id', 'name']
      },
      {
        unique: true,
        fields: ['email']
      }
    ]
  })
  return admin
}
