const Transformer = require('object-transformer')
const {Op} = require('sequelize');
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const Helper = require('../../services/Helper')
const moment = require('moment')
const {} = require('../../services/UserValidation')
const {podsList} = require('../../transformers/api/PodsTransformer')
const {Pods, User, podBookings} = require('../../models')


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
                // console.log(result);
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
}


