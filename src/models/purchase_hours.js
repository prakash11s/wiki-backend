'use strict';
const Constants = require('../services/Constants')
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PurchaseHours extends Model {
        static associate(models) {
            PurchaseHours.hasMany(models.userAccount, {
                foreignKey: 'membership_id',
                sourceKey: 'id'
            })
        }
    }
    PurchaseHours.init({
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING(30),
        },
        price: {
            type: DataTypes.INTEGER
        },
        hours: {
            type: DataTypes.INTEGER
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0-Gernal_Pricing, 1-BULK_PRICING'
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        modelName: 'PurchaseHours',
        tableName: 'purchase_hours',
        timestamps: true
    })

    return PurchaseHours;
}