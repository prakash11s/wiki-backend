const { Model } = require('sequelize')
const Constants = require('../services/Constants')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate (models) {
      User.hasOne(models.userSocial, {
        foreignKey: 'user_id',
        sourceKey: 'id'
      })
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(50)
    },
    last_name: {
      type: DataTypes.STRING(50)
    },
    mobile: {
      type: DataTypes.STRING(20)
    },
    new_mobile: {
      type: DataTypes.STRING(100),
    },
    email: {
      type: DataTypes.STRING(100)
    },
    new_email: {
      type: DataTypes.STRING(100),
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(100)
    },
    mobile_otp: {
      type: DataTypes.STRING(10),
    },
    mobile_otp_expiry: {
      type: DataTypes.DATE,
    },
    email_otp: {
      type: DataTypes.STRING(10),
    },
    email_otp_expiry: {
      type: DataTypes.DATE,
    },
    profile_image: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    is_mobile_verified: {
      type: DataTypes.INTEGER,
      defaultsTo: false
    },
    is_email_verified: {
      type: DataTypes.INTEGER,
      defaultsTo: false
    },
    is_kyc_verified: {
      type: DataTypes.INTEGER,
      defaultsTo: false
    },
    status: {
      type: DataTypes.INTEGER,
      defaultsTo: Constants.INACTIVE
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true
  })
  return User
}
