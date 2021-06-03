'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userKYC extends Model {
    static associate(models) {
      userKYC.belongsTo(models.User, {
        sourceKey: 'id',
        foreignKey: 'user_id'
      })
    }
  }
  userKYC.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    firstName: DataTypes.STRING,
    midName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    dob: DataTypes.DATE,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    photo_id_proof: DataTypes.STRING,
    photo_id_image: DataTypes.STRING,
    address_proof: DataTypes.STRING,
    address_image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'userKYC',
    tableName: 'user_kyc',
  });
  return userKYC;
};