const {Transaction, Membership, userAccount} = require('../../models')
const Constants = require('../../services/Constants')
const Response = require('../../services/Response')
const Transformer = require('object-transformer')
const {transactionsList} = require("../../transformers/api/TransactionTransformer");


module.exports = {
    /**
     * Register Transaction for membership purchase only
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    registerNewTransaction: async (req, res) => {
        const user_id = req.authUserId; //User Id From JWT Token
        const requestParams = req.body; //Body Form

        const transaction_type = requestParams.transaction_type;
        const status = requestParams.status;
        const product_id = requestParams.product_id;

        let userAccountValue, membership;

        //Get Product Info From Membership Table and Add to User Table Balance
        await Membership.findOne({
            where: {id: product_id},
        }).then(memberShipResult => {
            //After Get Membership Info
            membership = memberShipResult.dataValues;
        }).catch(e => {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                Constants.INTERNAL_SERVER
            )
        })

        //User Account Information
        await userAccount.findOne({
            where: {
                user_id: user_id
            }
        }).then(async userAccountResult => {
            //Update User Account Balance
            if (userAccountResult) { //If Exist Then update
                await userAccount.update({
                    membership_id: membership.id,
                    individual_hrs: membership.individual_hrs + userAccountResult.dataValues.individual_hrs,
                    group_pod_hrs: membership.group_pod_hrs + userAccountResult.dataValues.group_pod_hrs,
                    terrace_hrs: membership.terrace_hrs + userAccountResult.dataValues.terrace_hrs
                }, {
                    where: {
                        user_id: user_id,
                    }
                }).then(async (result) => {
                    if (result) {
                        console.log(result)
                        //Add Transaction to DB
                        await Transaction.create({
                            user_id,
                            transaction_type,
                            status,
                            product: membership.name,
                            product_id: membership.id,
                            transaction: membership.price
                        }).then(async (result) => {
                            if (result) {
                                return Response.successResponseWithoutData(
                                    res,
                                    res.__('Pod Booking Add Successfully'),
                                    Constants.SUCCESS
                                )
                            }
                        }).catch((e) => {
                            return Response.errorResponseData(
                                res,
                                res.__('internalError'),
                                Constants.INTERNAL_SERVER
                            )
                        })
                    }
                }).catch((e) => {
                    console.log(e)
                    return Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    )
                });
            } else { //Create New User Account
                await userAccount.create({
                    user_id: user_id,
                    membership_id: membership.id,
                    individual_hrs: membership.individual_hrs,
                    group_pod_hrs: membership.group_pod_hrs,
                    terrace_hrs: membership.terrace_hrs
                }).then(async (result) => {
                    if (result) {
                        //Add Transaction to DB
                        await Transaction.create({
                            user_id,
                            transaction_type,
                            status,
                            product: membership.name,
                            product_id: membership.id,
                            transaction: membership.price
                        }).then(async (result) => {
                            if (result) {
                                return Response.successResponseWithoutData(
                                    res,
                                    res.__('Pod Booking Add Successfully'),
                                    Constants.SUCCESS
                                )
                            }
                        }).catch((e) => {
                            return Response.errorResponseData(
                                res,
                                res.__('internalError'),
                                Constants.INTERNAL_SERVER
                            )
                        })
                    }
                }).catch(() => {
                    return Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    )
                });
            }
        }).catch(e => {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                Constants.INTERNAL_SERVER
            )
        })
    },

    /**
     * Get All Transaction for User
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getAllTransactions: async (req, res) => {
        const user_id = req.authUserId; //User Id From JWT Token

        await Transaction.findAndCountAll({
            where: {
                user_id
            },
            order: [['createdAt', 'DESC']]
        }).then(async data => {
            if (data.rows.length > 0) {
                const result = data.rows
                return Response.successResponseData(
                    res,
                    new Transformer.List(result, transactionsList).parse(),
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