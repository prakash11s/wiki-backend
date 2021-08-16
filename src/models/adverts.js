'use strict';
const Constants = require('../services/Constants')
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Adverts extends Model {
    }

    Adverts.init({
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
        advert_image: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'Adverts',
        tableName: 'adverts',
        timestamps: true
    })

    return Adverts;
}
