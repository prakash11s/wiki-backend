const { Model } = require('sequelize')

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
    email: {
      type: DataTypes.STRING(100)
    },
    new_email: {
      type: DataTypes.STRING(100),
      defaultsTo: ''
    },
    email_expiry: {
      type: DataTypes.DATE,
      defaultsTo: null
    },
    address: {
      type: DataTypes.STRING(200)
    },
    password: {
      type: DataTypes.STRING(100)
    },
    otp: {
      type: DataTypes.STRING(10),
      defaultsTo: ''
    },
    otp_expiry: {
      type: DataTypes.DATE,
      defaultsTo: null
    },
    qr_code: {
      type: DataTypes.STRING
    },
    profile_image: {
      type: DataTypes.STRING(50)
    },
    verification_status: {
      type: DataTypes.INTEGER
    },
    new_mobile: {
      type: DataTypes.STRING(20)
    },
    new_verification_status: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true
  })
  return User
}
