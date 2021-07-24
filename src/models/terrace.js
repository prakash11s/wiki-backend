'use strict';
const Constants = require('../services/Constants')
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Terrace extends Model {
        static associate(models) {
            Terrace.hasMany(models.terraceBooking, {
                sourceKey: 'id',
                foreignKey: 'terrace_id'
            })
        }
    }

    Terrace.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
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
        modelName: 'Terrace',
        tableName: 'terrace',
        timestamps: true
    });
    return Terrace;
};