// noinspection DuplicatedCode

const {Op} = require('sequelize');
const moment = require('moment')
const Transformer = require('object-transformer');
const path = require('path')
const Constants = require('../../services/Constants');
const {Adverts} = require('../../models');
const Response = require('../../services/Response');
const Helper = require('../../services/Helper')
const {} = require('../../transformers/admin/advertsTransformer')
const {advertAddEditValidation} = require('../../services/AdminValidation')

module.exports = {

    /**
     * @description 'This function is use to add add Adverts.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    addAdverts: async (req, res) => {
        const requestParams = req.fields
        const imagePath = req.files.advert_image.path
        let image = false
        advertAddEditValidation(requestParams, res, async (validate) => {
            if (validate) {
                const time = moment().unix()
                if (req.files.advert_image && req.files.advert_image.size > 0) {
                    image = true
                    await Helper.imageValidation(req, res, req.files.advert_image)
                    await Helper.imageSizeValidation(req, res, req.files.advert_image.size)
                } else {
                    return Response.errorResponseData(
                        res,
                        res.__('imageIsRequired'),
                        Constants.BAD_REQUEST
                    )
                }
                const advertImage = image ? `${time}${path.extname(req.files.advert_image.name)}` : ''
                const advertsObj = {
                    name: requestParams.name,
                    description: requestParams.description,
                }
                if (image) {
                    advertsObj.advert_image = advertImage
                }
                await Adverts.create(advertsObj)
                    .then(async (result) => {
                        if (result) {
                            if (image) {
                                await Helper.uploadMediaToS3(advertImage, imagePath, Constants.ADVERT_IMAGE_PATH_S3, req, res)
                            }
                            Response.successResponseWithoutData(
                                res,
                                res.__('advertAddedSuccessfully.'),
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

    advertsList: async (req, res) => {
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
        await Adverts.findAndCountAll({
            order: sorting,
            offset,
            limit,
            distinct: true
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                Object.keys(result).forEach((key) => {
                    if ({}.hasOwnProperty.call(result, key)) {
                        result[key].advert_image = result[key].advert_image ? Helper.mediaUrlForS3(Constants.ADVERT_IMAGE_PATH_S3, result[key].advert_image) : ''
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
    }
}
