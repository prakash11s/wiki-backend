const {PurchaseHours} = require('../../models')
const {purchaseHoursList} = require('../../transformers/api/PurchaseHoursTransformer')
const Constants = require('../../services/Constants')
const Response = require('../../services/Response')
const Transformer = require('object-transformer')

module.exports = {
    getPurchaseHoursList: async (req, res) => {
        let query = {};
        let sorting = [['createdAt', 'DESC']];
        await PurchaseHours.findAndCountAll({
            where: query,
            order: sorting,
        })
            .then(async (data) => {
                if (data.rows.length > 0) {
                    const result = data.rows
                    return Response.successResponseData(
                        res,
                        new Transformer.List(result, purchaseHoursList).parse(),
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
};