const {Membership} = require('../../models')
const {allMemberShip} = require('../../transformers/api/MembershipTransformer')
const Constants = require('../../services/Constants')
const Response = require('../../services/Response')
const Transformer = require('object-transformer')

module.exports = {
    getAllMemberships: async (req, res) => {
        let query = {};
        let sorting = [['createdAt', 'DESC']];
        await Membership.findAndCountAll({
            where: query,
            order: sorting,
        }).then(async (data) => {
                if (data.rows.length > 0) {
                    const result = data.rows
                    Object.keys(result).forEach((key) => {
                        if ({}.hasOwnProperty.call(result, key)) {
                            result[key].perks = result[key].perks.split(',');
                        }
                    })
                    return Response.successResponseData(
                        res,
                        new Transformer.List(result, allMemberShip).parse(),
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
