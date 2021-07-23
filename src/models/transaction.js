const Constants = require('../services/Constants')
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'user_id'
            })
        }
    }

    Transaction.init({
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
        transaction_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Constants.INACTIVE,
            comment: '0-membership_payment, 1-account_balance_user'
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Constants.INACTIVE,
            comment: '0-success, 1-failed, 2-pending'
        },
        product: {
            type: DataTypes.INTEGER,
        },
        product_id: {
            type: DataTypes.INTEGER,
        },
        transaction: {
            type: DataTypes.INTEGER,
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transaction',
        timestamps: true
    })

    return Transaction;
};