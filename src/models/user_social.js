const {Model} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class userSocial extends Model {
        static associate(models) {
            userSocial.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'user_id'
            })
        }
    }
    userSocial.init({
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
        social_id: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING
        },
        provider_data: {
            allowNull: true,
            type: DataTypes.JSON,
        }
    }, {
        sequelize,
        modelName: 'userSocial',
        tableName: 'user_socials',
        timestamps: true
    });
    return userSocial;
};
