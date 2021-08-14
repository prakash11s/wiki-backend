// noinspection DuplicatedCode

const {Op} = require('sequelize');
const Transformer = require('object-transformer');
const Constants = require('../../services/Constants');
const {User, userKYC, userAccount} = require('../../models');
const Response = require('../../services/Response');
const Helper = require('../../services/Helper')
const {userKycDetails} = require('../../transformers/admin/UserTransformer')
const {KYCStatusUpdateValidation} = require('../../services/AdminValidation')

module.exports = {

    /**
     * @description This Function is to Get User's KYC Details
     * @param req
     * @param res
     * */
    userKycDetails: async (req, res) => {
        const userId = req.params.user_id
        if (userId === null) {
            return Response.errorResponseData(
                res,
                res.__('invalidId'),
                Constants.BAD_REQUEST
            )
        } else {
            await userKYC.findOne({
                where: {
                    user_id: userId,
                },
                include: [
                    {
                        model: User,
                        attributes: ['is_kyc_verified']
                    }
                ]
            }).then(async (result) => {
                if (result) {
                    result.kyc_status = result.User.is_kyc_verified
                    result.photo_id_image = Helper.mediaUrl(Constants.PHOTO_IMAGE, result.photo_id_image)
                    return Response.successResponseData(
                        res,
                        new Transformer.Single(result, userKycDetails).parse(),
                        Constants.SUCCESS,
                        res.__('success')
                    )
                } else {
                    return Response.successResponseData(
                        res,
                        {},
                        Constants.SUCCESS,
                        res.__('noKYCFound')
                    )
                }
            }).catch(() => {
                return Response.errorResponseData(
                    res,
                    res.__('internalError'),
                    Constants.INTERNAL_SERVER
                )
            })
        }
    },


    /**
     * @description This Function is to Update User's KYC Status
     * @param req
     * @param res
     * */
    updateUserKYCStatus: (req, res) => {
        const requestParams = req.body
        const userId = req.params.user_id
        KYCStatusUpdateValidation(requestParams, res, (validate) => {
            if (validate) {
                User.update({
                    is_kyc_verified: parseInt(requestParams.kyc_status)
                }, {
                    where: {
                        id: userId
                    }
                }).then((userData) => {
                    if (userData) {
                        return Response.successResponseWithoutData(
                            res,
                            res.__('KYCStatusUpdateSuccess')
                        )
                    }
                }).catch((e) => {
                    console.log(e)
                    return Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    )
                })
            }
        })
    },


    /**
     * @description This Function is to Get All User's KYC List
     * @param req
     * @param res
     * */
    kycList: async (req, res) => {
        const requestParams = req.query;
        const limit = requestParams.per_page && requestParams.per_page > 0
            ? parseInt(requestParams.per_page, 10)
            : Constants.PER_PAGE;
        const pageNo = requestParams.page && requestParams.page > 0
            ? parseInt(requestParams.page, 10)
            : 1;
        const offset = (pageNo - 1) * limit;
        let query = {};
        if (requestParams.status && requestParams.status !== '') {
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
        await userKYC.findAndCountAll({
            order: sorting,
            offset,
            limit,
            distinct: true,
            include: [
                {
                    model: userAccount,
                    attributes: ['mobile', 'email', 'profile_image', 'is_kyc_verified']
                }
            ]
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                Object.keys(result).forEach((key) => {
                    if ({}.hasOwnProperty.call(result, key)) {
                        result[key].photo_id_image = Helper.mediaUrlForS3(Constants.KYC_IMAGE_PATH_S3, result[key].photo_id_image)
                    }
                })
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
