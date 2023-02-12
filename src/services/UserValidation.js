const Response = require('./Response')
const Joi = require('@hapi/joi')
const Helper = require('./Helper')
const Constants = require('../services/Constants')

module.exports = {

    userLoginValidation: (req, res, callback) => {
        const schema = Joi.object({
            email: Joi.string().trim().email().optional().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
            password: Joi.string().trim().optional(),
        })
        const {error} = schema.validate(req)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('loginPasswordValidation', error))
            )
        }
        return callback(true)
    },

    productValidation: (req, res, callback) => {
        const schema = Joi.object({
            productVariantName: Joi.string().trim().required(),
            name: Joi.string().trim().required(),
            qty: Joi.number().required(),
            price: Joi.number().required(),
            color: Joi.string().required()
        })
        const {error} = schema.validate(req)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('productValidation', error))
            )
        }
        return callback(true)
    },

    orderValidation: (req, res, callback) => {
        const requestObj = {
            placeAnOrder: Joi.array()
              .items(
                Joi.object({
                    user_id: Joi.number().required(),
                    product_id: Joi.string().trim().required(),
                    productVariantName: Joi.string().trim().required(),
                    name: Joi.string().trim().required(),
                    price: Joi.number().required(),
                    qty: Joi.number().required(),
                    order_quantity: Joi.number().required(),
                    color: Joi.string().trim().required(),
                })
              )
              .required(),
          }
          const schema = Joi.object(requestObj)
          const { error } = schema.validate(req)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('orderValidation', error))
            )
        }
        return callback(true)
    }

}
