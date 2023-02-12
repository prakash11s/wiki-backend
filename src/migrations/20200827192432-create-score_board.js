
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('score_board', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            run: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            batsman: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            score: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            wicket: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            over: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('score_board');
    }
}
