'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class userAccount extends Model {
        static associate(models) {
            userAccount.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'user_id'
            })
            userAccount.hasOne(models.Subscription, {
                sourceKey: 'id',
                foreignKey: 'subscription_id'
            })
        }
    }

    userAccount.init({
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        subscription_id : {
            type: DataTypes.INTEGER,
            references: {
                model: 'subscriptions',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'userAccount',
        tableName: 'user_accounts',
    });
    return userAccount;
};