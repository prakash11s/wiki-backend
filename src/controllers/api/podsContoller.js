const Transformer = require('object-transformer')
const {Op} = require('sequelize');
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const Helper = require('../../services/Helper')
const moment = require('moment')
const {} = require('../../services/UserValidation')
const {podsList, podsDetailsList} = require('../../transformers/api/PodsTransformer')
const {Pods, User, podBookings, Transaction, userAccount} = require('../../models')


module.exports = {

    allPodsList: async (req, res) => {
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
     * @description 'This function is use to get pods details with time slot.'
     * @param req
     * @param res
     * @returns {Promise<{data: *, meta: {message: *, code: *}}>}
     */
    podsDetails: async (req, res) => {
        const requestParams = req.query;

        //TODO: GET Get Pod_ID  and Date From Front End
        const pod_id = requestParams.pod_id;

        //Get POD Date
        let pod_booking_date;
        if (requestParams.date === undefined)
            pod_booking_date = moment(new Date).format('YYYY-MM-DD')
        else
            pod_booking_date = requestParams.date;


        //TODO: Create Query Using Front End Data to fetch info
        let query = {
            booking_date: pod_booking_date,
            pod_id: pod_id
        };
        let sorting = [['start_time', 'ASC']];

        await podBookings.findAndCountAll({
            where: query,
            order: sorting,
        }).then(async (data) => {
            if (data.rows.length > 0) {
                const result = data.rows
                return Response.successResponseData(
                    res,
                    new Transformer.List(result, podsDetailsList).parse(),
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
    podsBooking: async (req, res) => {
        //TODO: Pod Booking in Array Concept Add

        const requestParams = req.body;
        const user_id = req.authUserId;
        // console.log(user_id);

        //TODO: Check User Information
        const pod_id = requestParams.pod_id;
        const booking_date = requestParams.booking_date; //Formate yyyy-mm-dd
        const start_time = requestParams.start_time;
        const end_time = requestParams.end_time;
        const booking_hours = requestParams.booking_hours;
        let podDetails = {};

        await Pods.findOne({
            where: {
                id: pod_id
            },
        }).then(async data => {
            podDetails = data.dataValues;
        })

        //TODO: Insert New Order Into Tabel
        await podBookings.create({
            user_id,
            pod_id,
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
                    let query = {}
                    //Update Hours
                    if (podDetails.type === "group") {
                        query = {
                            group_pod_hrs: userAccountResult.group_pod_hrs - parseInt(booking_hours),
                        }
                    } else {
                        query = {
                            individual_hrs: userAccountResult.individual_hrs - parseInt(booking_hours),
                        }
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


