'use strict';
const {Model} = require('sequelize');
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
        first_name: {
            type: DataTypes.STRING
        },
        middle_name: {
            type: DataTypes.STRING
        },
        last_name: {
            type: DataTypes.STRING
        },
        date_of_birth: {
            type: DataTypes.DATE
        },
        address: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        },
        pin_code: {
            type: DataTypes.STRING
        },
        photo_id_proof: {
            type: DataTypes.STRING
        },
        photo_id_image: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'userKYC',
        tableName: 'user_kyc',
        timestamps: true
    });
    return userKYC;
};