const {Op} = require('sequelize');
const Transformer = require('object-transformer');
const Constants = require('../../services/Constants');
const {User} = require('../../models');
const Response = require('../../services/Response');
const {
    userChangeStatusValidation
} = require('../../services/AdminValidation');
const {userList} = require('../../transformers/admin/UserTransformer')
const Helper = require('../../services/Helper')

module.exports = {

    /**
     * @description This Function is for User's List
     * @param req
     * @param res
     * */
    userList: async (req, res) => {
        const requestParams = req.query;
        let search = false;
        const limit = requestParams.per_page && requestParams.per_page > 0
            ? parseInt(requestParams.per_page, 10)
            : Constants.PER_PAGE;
        const pageNo = requestParams.page && requestParams.page > 0
            ? parseInt(requestParams.page, 10)
            : 1;
        const offset = (pageNo - 1) * limit;
        let query = {};
        query = {
            status: {
                [Op.ne]: Constants.DELETE
            }
        };

        if (requestParams.first_name && requestParams.first_name !== '') {
            search = true;
            query = {
                ...query,
                first_name: {[Op.like]: `%${requestParams.first_name}%`}
            };
        }
        if (requestParams.email && requestParams.email !== '') {
            search = true;
            query = {
                ...query,
                email: {[Op.like]: `%${requestParams.email}%`}
            };
        }
        if (requestParams.mobile && requestParams.mobile !== '') {
            search = true;
            query = {
                ...query,
                mobile: {[Op.like]: `%${requestParams.mobile}%`}
            };
        }

        if (requestParams.status && requestParams.status !== '') {
            search = true;
            requestParams.status = requestParams.status.toString()
                .split(',');
            query = {
                ...query,
                [Op.or]: [
                    {
                        status: {[Op.in]: requestParams.status}
                    }
                ]
            };
        }

        let sorting = [['updatedAt', 'DESC']];
        if (requestParams.order_by && requestParams.order_by !== '') {
            sorting = [
                [
                    requestParams.order_by,
                    requestParams.direction ? requestParams.direction : 'DESC'
                ]
            ];
        }
        await User.findAndCountAll({
            where: query,
            order: sorting,
            offset,
            limit,
            distinct: true
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows;
                Object.keys(result).forEach((key) => {
                    if ({}.hasOwnProperty.call(result, key)) {
                        result[key].profile_image = Helper.mediaUrl(Constants.USER_PROFILE_IMAGE, result[key].profile_image)
                    }
                })
                const extra = [];
                extra.per_page = limit;
                extra.total = data.count;
                extra.page = pageNo;
                return Response.successResponseData(
                    res,
                    new Transformer.List(result, userList).parse(),
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


    /**
     * @description This Function is for User's Status Update
     * @param req
     * @param res
     * */
    userUpdateStatus: async (req, res) => {
        const requestParams = req.fields
        const ids = requestParams.ids.split(',')
        userChangeStatusValidation(requestParams, res, async (validate) => {
            if (validate) {
                await User.findAll({
                    where: {
                        id: ids
                    }
                }).then(async (UserData) => {
                    if (UserData.length > 0) {
                        User.update(
                            {status: requestParams.status},
                            {where: {id: ids}}
                        ).then((result) => {
                            if (result) {
                                if (parseInt(requestParams.status, 10) === Constants.ACTIVE) {
                                    return Response.successResponseWithoutData(
                                        res,
                                        res.locals.__('UserActiveSuccess'),
                                        Constants.SUCCESS
                                    )
                                } else if (parseInt(requestParams.status, 10) === Constants.INACTIVE) {
                                    return Response.successResponseWithoutData(
                                        res,
                                        res.locals.__('UserDeActiveSuccess'),
                                        Constants.SUCCESS
                                    )
                                } else {
                                    return Response.successResponseWithoutData(
                                        res,
                                        res.locals.__('UserDeleteSuccess'),
                                        Constants.SUCCESS
                                    )
                                }
                            }
                            return null
                        })
                            .catch(() => {
                                return Response.errorResponseData(
                                    res,
                                    res.__('internalError'),
                                    Constants.INTERNAL_SERVER
                                )
                            })
                    } else {
                        return Response.successResponseData(
                            res,
                            null,
                            Constants.SUCCESS,
                            res.locals.__('noUserFound')
                        )
                    }
                    return null
                })
                    .catch(() => {
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
     * @description detail of user
     * @param req
     * @param res
     * */
    userDetail: async (req, res) => {
        const requestParams = req.params;
        if (requestParams.id === null) {
            Response.errorResponseData(
                res,
                res.__('invalidGroupId'),
                Constants.BAD_REQUEST
            );
        } else {
            await User.findOne({
                where: {
                    id: requestParams.id,
                    status: {
                        [Op.in]: [Constants.ACTIVE, Constants.INACTIVE]
                    }
                }
            })
                .then(async (result) => {
                    if (result) {
                        return Response.successResponseData(
                            res,
                            result,
                            Constants.SUCCESS,
                            res.locals.__('success'),
                            null
                        );
                    }

                    return Response.successResponseWithoutData(
                        res,
                        res.locals.__('noDataFound'),
                        Constants.FAIL
                    );
                })
                .catch(() => {
                    Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    );
                });
        }
    },

};
