'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class userAccount extends Model {
        static associate(models) {
            userAccount.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'user_id'
            })
            userAccount.belongsTo(models.Membership, {
                sourceKey: 'id',
                foreignKey: 'membership_id'
            })
        }
    }
    userAccount.init({
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        membership_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'membership',
                key: 'id'
            },
            allowNull : true
        },
        individual_hrs: {
            type: DataTypes.INTEGER,
            defaultValue : 0
        },
        group_pod_hrs: {
            type: DataTypes.INTEGER,
            defaultValue : 0
        },
        terrace_hrs: {
            type: DataTypes.INTEGER,
            defaultValue : 0
        }
    }, {
        sequelize,
        modelName: 'userAccount',
        tableName: 'user_accounts',
        timestamps: true
    });
    return userAccount;
};