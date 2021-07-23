'use strict';
const Constants = require('../services/Constants')
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Pods extends Model {
        static associate(models) {
            Pods.hasMany(models.podBookings, {
                sourceKey: 'id',
                foreignKey: 'pod_id'
            })
        }
    }
    Pods.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.ENUM([Constants.POD_TYPE.INDIVIDUAL, Constants.POD_TYPE.GROUP]),
        },
        price: {
            type: DataTypes.INTEGER
        },
        location: {
            type: DataTypes.INTEGER
        },
        status: {
            type: DataTypes.INTEGER,
            defaultsTo: Constants.ACTIVE
        }
    }, {
        sequelize,
        modelName: 'Pods',
        tableName: 'pods',
        timestamps: true
    });
    return Pods;
};