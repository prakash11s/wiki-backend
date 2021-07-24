'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class terraceBooking extends Model {
        static associate(models) {
            terraceBooking.belongsTo(models.Terrace, {
                sourceKey: 'id',
                foreignKey: 'user_id'
            })
        }
    }
    terraceBooking.init({
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
        terrace_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'terrace',
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
        modelName: 'terraceBooking',
        tableName: 'terrace_bookings',
        timestamps: true
    });
    return terraceBooking;
};