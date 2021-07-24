const Transformer = require('object-transformer')
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const Helper = require('../../services/Helper')
const moment = require('moment')
const {
    kycValidation,
} = require('../../services/UserValidation')
const {userKycDetails} = require('../../transformers/api/UserTransformer')
const {User, userKYC} = require('../../models')
const path = require('path')


module.exports = {

    /**
     * @description 'This function is use to add add user's KYC.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    kycAdd: async (req, res) => {
        const userId = req.authUserId
        const requestParams = req.fields
        let image = false
        kycValidation(requestParams, res, async (validate) => {
            if (validate) {
                const time = moment().unix()
                if (req.files.photo_id_image && req.files.photo_id_image.size > 0) {
                    image = true
                    await Helper.imageValidation(req, res, req.files.photo_id_image)
                    await Helper.imageSizeValidation(req, res, req.files.photo_id_image.size)
                } else {
                    return Response.errorResponseData(
                        res,
                        res.__('imageIsRequired'),
                        Constants.BAD_REQUEST
                    )
                }
                const photoIDImage = image ? `${time}${path.extname(req.files.photo_id_image.name)}` : ''
                const userKycObj = {
                    user_id : userId,
                    first_name: requestParams.first_name,
                    middle_name: requestParams.middle_name,
                    last_name: requestParams.last_name,
                    date_of_birth: requestParams.date_of_birth,
                    address: requestParams.address,
                    city: requestParams.city,
                    state: requestParams.state,
                    pin_code: requestParams.pin_code
                }
                if (image) {
                    userKycObj.photo_id_proof = requestParams.photo_id_proof
                    userKycObj.photo_id_image = photoIDImage
                }
                await userKYC.create(userKycObj)
                    .then(async (result) => {
                        if (result) {
                            if (image) {
                                await Helper.uploadImage(req.files.photo_id_image, Constants.PHOTO_IMAGE, photoIDImage)
                            }
                            Response.successResponseWithoutData(
                                res,
                                res.__('KYCAddedSuccessfully.'),
                                Constants.SUCCESS,
                            )
                        }
                    }).catch(async (e) => {
                        console.log(e)
                        Response.errorResponseData(
                            res,
                            res.__('internalError'),
                            Constants.INTERNAL_SERVER
                        )
                    })
            }
        })
    },


    /**
     * @description 'This function is use to update user's KYC.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    updateKyc: async (req, res) => {
        const userId = req.authUserId
        const requestParams = req.fields
        let image = false
        kycValidation(requestParams, res, async (validate) => {
            if (validate) {
                const time = moment().unix()
                if (req.files.photo_id_image && req.files.photo_id_image.size > 0) {
                    image = true
                    await Helper.imageValidation(req, res, req.files.photo_id_image)
                    await Helper.imageSizeValidation(req, res, req.files.photo_id_image.size)
                } else {
                    return Response.errorResponseData(
                        res,
                        res.__('imageIsRequired'),
                        Constants.BAD_REQUEST
                    )
                }
                const photoIDImage = image ? `${time}${path.extname(req.files.photo_id_image.name)}` : ''
                await userKYC.findOne({
                    where: {
                        user_id: userId
                    }
                }).then(async (result) => {
                    if (result) {
                        const oldImageName = result.photo_id_image
                        result.first_name = requestParams.first_name
                        result.last_name = requestParams.last_name
                        result.date_of_birth = requestParams.date_of_birth
                        result.address = requestParams.address
                        result.city = requestParams.city
                        result.state = requestParams.state
                        result.pin_code = requestParams.pin_code
                        if (image) {
                            result.photo_id_proof = requestParams.photo_id_proof
                            result.photo_id_image = photoIDImage
                        }
                        await result.save()
                        if (image) {
                            console.log(await Helper.uploadImage(req.files.photo_id_image, Constants.PHOTO_IMAGE, photoIDImage))
                            console.log(await Helper.removeOldImage(oldImageName, Constants.PHOTO_IMAGE, res))
                        }
                        Response.successResponseWithoutData(
                            res,
                            res.__('KYCUpdatedSuccessfully'),
                            Constants.SUCCESS,
                        )
                    }
                }).catch(async (e) => {
                        Response.errorResponseData(
                            res,
                            res.__('internalError'),
                            Constants.INTERNAL_SERVER
                        )
                    })
            }
        })
    },


    /**
     * @description 'This function is for User's KYC Details.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    kycDetails: async (req, res) => {
        const userId = req.authUserId
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
                }
            }).then(async (result) => {
                if (result) {
                    console.log(result)
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
            })
                .catch(() => {
                    return Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    )
                })
        }
    },
}


