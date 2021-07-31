const {Op} = require('sequelize');
const Transformer = require('object-transformer');
const Constants = require('../../services/Constants');
const {User, userKYC} = require('../../models');
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
    }
}