'use strict';
const Constants = require('../services/Constants')
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Membership extends Model {
        static associate(models) {
            Membership.hasMany(models.userAccount, {
                foreignKey: 'membership_id',
                sourceKey: 'id'
            })
        }
    }
    Membership.init({
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING(30),
        },
        price: {
            type: DataTypes.INTEGER
        },
        individual_hrs: {
            type: DataTypes.INTEGER
        },
        group_pod_hrs: {
            type: DataTypes.INTEGER
        },
        terrace_hrs: {
            type: DataTypes.INTEGER
        },
        individual_price: {
            type: DataTypes.INTEGER
        },
        group_price: {
            type: DataTypes.INTEGER
        },
        terrace_price: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize,
        modelName: 'Membership',
        tableName: 'membership',
        timestamps: true
    })

    return Membership;
}