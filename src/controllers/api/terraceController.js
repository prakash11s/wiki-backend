const Transformer = require('object-transformer')
const {Op} = require('sequelize');
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const Helper = require('../../services/Helper')
const moment = require('moment')
const {} = require('../../services/UserValidation')
const {terracePodsList, terracePodsDetailsList} = require('../../transformers/api/TerraceTransformer')
const {Terrace, User, terraceBooking, Transaction, userAccount} = require('../../models')


module.exports = {

    allTerracePodsList: async (req, res) => {
        const requestParams = req.query;
        let query = {};
        query = {
            status: {
                [Op.ne]: Constants.DELETE
            },
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


    /**
     * @description 'This function is use to get pods details with time slot.'
     * @param req
     * @param res
     * @returns {Promise<{data: *, meta: {message: *, code: *}}>}
     */
    terracePodsDetails: async (req, res) => {
        const requestParams = req.query;

        //TODO: GET Get Pod_ID  and Date From Front End
        const terrace_pod_id = requestParams.terrace_pod_id;

        //Get POD Date
        let terrace_pod_booking_date;
        if (requestParams.date === undefined)
            terrace_pod_booking_date = moment(new Date).format('YYYY-MM-DD')
        else
            terrace_pod_booking_date = requestParams.date;


        //TODO: Create Query Using Front End Data to fetch info
        let query = {
            booking_date: terrace_pod_booking_date,
            terrace_id: terrace_pod_id
        };
        let sorting = [['start_time', 'ASC']];

        await terraceBooking.findAndCountAll({
            where: query,
            order: sorting,
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                return Response.successResponseData(
                    res,
                    new Transformer.List(result, terracePodsDetailsList).parse(),
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
     * @description 'This function is use to book pod.'
     * @param req
     * @param res
     * @returns {Promise<{data: *, meta: {message: *, code: *}}>}
     */
    terracePodsBooking: async (req, res) => {
        //TODO: Pod Booking in Array Concept Add

        const requestParams = req.body;
        const user_id = req.authUserId;
        // console.log(user_id);

        //TODO: Check User Information
        const terrace_id = requestParams.terrace_id;
        const booking_date = requestParams.booking_date; //Formate yyyy-mm-dd
        const start_time = requestParams.start_time;
        const end_time = requestParams.end_time;
        const booking_hours = requestParams.booking_hours;
        let podDetails = {};

        await Terrace.findOne({
            where: {
                id: terrace_id
            },
        }).then(async data => {
            podDetails = data.dataValues;
        })

        //TODO: Insert New Order Into Tabel
        await terraceBooking.create({
            user_id,
            terrace_id,
            booking_date,
            start_time,
            end_time,
            booking_hours,
        }).then(async (result) => {
            if (result) {
                await userAccount.findOne({ //GET User Existing Balance
                    where: {
                        user_id
                    }
                }).then(async (userData) => {
                    const userAccountResult = userData.dataValues;
                    let query = {
                        terrace_hrs: userAccountResult.terrace_hrs - parseInt(booking_hours),
                    }


                    await userAccount.update(query, { //Update User Existing Balance
                        where: {
                            user_id
                        }
                    }).then(async () => {
                        await Transaction.create({ //Transaction IN ADD
                            user_id,
                            transaction_type: 1,
                            status: 0,
                            product: podDetails.name,
                            product_id: podDetails.id,
                            transaction: booking_hours
                        }).then(() => {
                            return Response.successResponseWithoutData(
                                res,
                                res.__('Pod Booking Add Successfully'),
                                Constants.SUCCESS
                            )
                        }).catch(e => {
                            throw e
                        });
                    }).catch(err => {
                        throw err
                    });

                }).catch(err => {
                    throw err
                });
            }
        }).catch((e) => {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                Constants.INTERNAL_SERVER
            )
        })
    }
}


