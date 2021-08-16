const {Op} = require('sequelize');
const Transformer = require('object-transformer')
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const {addEditPodsValidation, addEditTerraceValidation} = require('../../services/AdminValidation')
const {Pods, Terrace} = require('../../models')
const {podsList} = require('../../transformers/api/PodsTransformer')
const {terracePodsList} = require('../../transformers/api/TerraceTransformer')

module.exports = {

    /**
     * @description This Function is to Add/Edit Pods
     * @param req
     * @param res
     * */
    addEditPods: async (req, res) => {
        const requestParams = req.body
        addEditPodsValidation(requestParams, res, async (validate) => {
            if (validate) {
                const podObj = {
                    name: requestParams.name,
                    type: requestParams.type,
                    price: parseInt(requestParams.price),
                    location: requestParams.location
                }
                if (requestParams.id) {
                    await Pods.findOne({
                        where: {
                            id: requestParams.id
                        }
                    }).then(async (checkPod) => {
                        if (!checkPod) {
                            Response.successResponseWithoutData(
                                res,
                                res.__('noPodFound'),
                                Constants.FAIL
                            )
                        }
                        await Pods.update(podObj, {
                            where: {
                                id: requestParams.id
                            }
                        }).then(() => {
                            Response.successResponseWithoutData(
                                res,
                                res.__('podsUpdatedSuccessfully'),
                                Constants.SUCCESS
                            )
                        })
                    })
                } else {
                    await Pods.create(
                        podObj
                    ).then((data) => {
                        if (data) {
                            return Response.successResponseWithoutData(
                                res,
                                res.__('podAddedSuccessfully'),
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
     * @description This Function is to get List of all Pods
     * @param req
     * @param res
     * */
    podsList: async (req, res) => {
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


    /**
     * @description This Function is to Add/Edit Terrace
     * @param req
     * @param res
     * */
    addEditTerrace: async (req, res) => {
        const requestParams = req.body
        addEditTerraceValidation(requestParams, res, async (validate) => {
            if (validate) {
                const terraceObj = {
                    name: requestParams.name,
                    price: parseInt(requestParams.price),
                    location: requestParams.location
                }
                if (requestParams.id) {
                    await Terrace.findOne({
                        where: {
                            id: requestParams.id
                        }
                    }).then(async (checkTerrace) => {
                        if (!checkTerrace) {
                            Response.successResponseWithoutData(
                                res,
                                res.__('noTerraceFound'),
                                Constants.FAIL
                            )
                        }
                        await Pods.update(terraceObj, {
                            where: {
                                id: requestParams.id
                            }
                        }).then(() => {
                            Response.successResponseWithoutData(
                                res,
                                res.__('terraceUpdatedSuccessfully'),
                                Constants.SUCCESS
                            )
                        })
                    })
                } else {
                    await Terrace.create(
                        terraceObj
                    ).then((data) => {
                        if (data) {
                            return Response.successResponseWithoutData(
                                res,
                                res.__('terraceAddedSuccessfully'),
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
     * @description This Function is to get List of all Terrace
     * @param req
     * @param res
     * */
    terraceList: async (req, res) => {
        let query = {};
        query = {
            status: {
                [Op.ne]: Constants.DELETE
            }
        }
        let sorting = [['createdAt', 'DESC']];
        await Terrace.findAndCountAll({
            where: query,
            order: sorting,
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                return Response.successResponseData(
                    res,
                    new Transformer.List(result, terracePodsList).parse(),
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
