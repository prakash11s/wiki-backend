'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class podBookings extends Model {
        static associate(models) {
            podBookings.belongsTo(models.Pods, {
                sourceKey: 'id',
                foreignKey: 'user_id'
            })
        }
    }
    podBookings.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        pod_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'pods',
                key: 'id'
            }
        },
        booking_hours: {
            type: DataTypes.INTEGER
        },
        booking_date: {
            type: DataTypes.INTEGER
        },
        start_time: {
            type: DataTypes.DATE
        },
        end_time: {
            type: DataTypes.DATE
        },
        amount:{
            type: DataTypes.INTEGER
        }
    }, {
        sequelize,
        modelName: 'podBookings',
        tableName: 'pod_bookings',
        timestamps: true
    });
    return podBookings;
};