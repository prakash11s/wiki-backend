// noinspection DuplicatedCode

const {Op} = require('sequelize');
const Transformer = require('object-transformer');
const Constants = require('../../services/Constants');
const {Membership} = require('../../models');
const Response = require('../../services/Response');
const Helper = require('../../services/Helper')
const {userKycDetails} = require('../../transformers/admin/UserTransformer')
const {addEditMembershipValidation} = require('../../services/AdminValidation')

module.exports = {

    /**
     * @description This Function is to Add/Edit Membership
     * @param req
     * @param res
     * */
    addEditMembership: async (req, res) => {
        const requestParams = req.body
        addEditMembershipValidation(requestParams, res, async (validate) => {
            if (validate) {
                const membershipObj = {
                    name: requestParams.name,
                    price: requestParams.price,
                    individual_hrs: requestParams.individual_hrs,
                    group_pod_hrs: requestParams.group_pod_hrs,
                    terrace_hrs: requestParams.terrace_hrs,
                    individual_price: requestParams.individual_price,
                    group_price: requestParams.group_price,
                    terrace_price: requestParams.terrace_price
                }
                if (requestParams.id) {
                    await Membership.findOne({
                        where: {
                            id: requestParams.id
                        }
                    }).then(async (checkMembership) => {
                        if (!checkMembership) {
                            Response.successResponseWithoutData(
                                res,
                                res.__('noSuchMembershipFound'),
                                Constants.FAIL
                            )
                        }
                        await Membership.update(membershipObj, {
                            where: {
                                id: requestParams.id
                            }
                        }).then(() => {
                            Response.successResponseWithoutData(
                                res,
                                res.__('membershipUpdatedSuccessfully'),
                                Constants.SUCCESS
                            )
                        })
                    })
                } else {
                    await Membership.create(
                        membershipObj
                    ).then((data) => {
                        if (data) {
                            return Response.successResponseWithoutData(
                                res,
                                res.__('membershipAddedSuccessfully'),
                                Constants.SUCCESS
                            )
                        }
                        return null
                    })
                }
            }
        })
    },


    /**
     * @description This Function is to Get All Memberships
     * @param req
     * @param res
     * */
    membershipList: async (req, res) => {
        const requestParams = req.query;
        const limit = requestParams.per_page && requestParams.per_page > 0
            ? parseInt(requestParams.per_page, 10)
            : Constants.PER_PAGE;
        const pageNo = requestParams.page && requestParams.page > 0
            ? parseInt(requestParams.page, 10)
            : 1;
        const offset = (pageNo - 1) * limit;
        let query = {};
        if(requestParams.status && requestParams.status !== ''){
        }
        let sorting = [['createdAt', 'DESC']];
        if (requestParams.order_by && requestParams.order_by !== '') {
            sorting = [
                [
                    requestParams.order_by,
                    requestParams.direction ? requestParams.direction : 'DESC'
                ]
            ];
        }
        await Membership.findAndCountAll({
            order: sorting,
            offset,
            limit,
            distinct: true
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                const extra = [];
                extra.per_page = limit;
                extra.total = data.count;
                extra.page = pageNo;
                return Response.successResponseData(
                    res,
                    result,
                    Constants.SUCCESS,
                    res.locals.__('success'),
                    extra
                );
            }
            return Response.successResponseData(
                res,
                [],
                Constants.SUCCESS,
                res.__('noDataFound')
            );
        });
    },
}