const Transformer = require('object-transformer')
const {Op} = require('sequelize');
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const Helper = require('../../services/Helper')
const moment = require('moment')
const {} = require('../../services/UserValidation')
const {podsList} = require('../../transformers/api/PodsTransformer')
const {Pods, User} = require('../../models')


module.exports = {

    allPodsList: async (req, res) => {
        const requestParams = req.query;
        let query = {};
        query = {
            status: {
                [Op.ne]: Constants.DELETE
            },
            type: requestParams.pod_type
        }
        let sorting = [['createdAt', 'DESC']];
        await Pods.findAndCountAll({
            where: query,
            order: sorting,
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                return Response.successResponseData(
                    res,
                    new Transformer.List(result, podsList).parse(),
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
    },
}


