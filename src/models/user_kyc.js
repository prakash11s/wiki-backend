'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_kyc extends Model {
    static associate(models) {
      user_kyc.belongsTo(models.User, {
        sourceKey: 'id',
        foreignKey: 'user_id'
      })
    }
  };
  user_kyc.init({
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
    modelName: 'user_kyc',
  });
  return user_kyc;
};