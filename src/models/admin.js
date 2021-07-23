const {Model} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class admin extends Model {
    }

    admin.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: DataTypes.INTEGER,
            defaultValue: 2,
            comment: '1:super-admin,2:sub-admin',
        },
        name: {
            type: DataTypes.STRING(50),
        },
        email: {
            type: DataTypes.STRING(150),
            unique: true
        },
        mobile: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }

    }, {
        sequelize,
        modelName: 'Admin',
        tableName: 'admin',
        timestamps: true,
        indexes: [
            {
                unique: false,
                fields: ['id', 'name']
            },
            {
                unique: true,
                fields: ['email']
            }
        ]
    })
    return admin
}
