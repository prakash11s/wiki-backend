const {userAccount} = require('../../models')
const Constants = require('../../services/Constants')
const Response = require('../../services/Response')
const Transformer = require('object-transformer')
const {getUserAccountBalance} = require('../../transformers/api/UserAccountTransformer')

module.exports = {
    /**
     * Get User Hrs Balance
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getUserAccountBalance: async (req, res) => {
        const user_id = req.authUserId; //User Id From JWT Token
        let query = {
            user_id: user_id
        };
        let sorting = [['createdAt', 'DESC']];

        await userAccount.findAndCountAll({
            where: query,
            order: sorting,
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                return Response.successResponseData(
                    res,
                    new Transformer.List(result, getUserAccountBalance).parse(),
                    Constants.SUCCESS,
                    res.locals.__('success'),
                )
            }
            return Response.successResponseData(
                res,
                [],
                Constants.SUCCESS,
                res.__('noDataFound')
            )
        })
    }
}