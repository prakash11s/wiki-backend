const Response = require('./Response')
const Joi = require('@hapi/joi')
const Helper = require('./Helper')
const Constants = require('../services/Constants')

module.exports = {

    userRegisterValidation: (req, res, callback) => {
        const schema = Joi.object({
            first_name: Joi.string().trim().required(),
            last_name: Joi.string().trim().required(),
            email: Joi.string().trim().email().required().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
            password: Joi.string().trim().min(6).optional().regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
            mobile: Joi.string().trim().min(10).max(10).required().regex(/^[6-9]\d{9}$/),
            //address: Joi.string().trim().min(10).required(),
            social_data: Joi.object().optional()
        })
        const {error} = schema.validate(req)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('userRegisterValidation', error))
            )
        }
        return callback(true)
    },

    userLoginValidation: (req, res, callback) => {
        const schema = Joi.object({
            email: Joi.string().trim().email().optional().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
            password: Joi.string().trim().optional(),
            social_id: Joi.string().trim(),
            access_token: Joi.string().trim(),
            expires_in: Joi.number().optional(),
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

    userSocialRegistrationValidation: (req, res, callback) => {
        const schema = Joi.object({
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().required(),
        })
        const {error} = schema.validate(req)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('userSocialRegistrationValidation', error))
            )
        }
        return callback(true)
    },
    kycValidation: (req, res, callback) => {
        const schema = Joi.object({
            first_name: Joi.string().trim().required(),
            middle_name: Joi.string().trim().required(),
            last_name: Joi.string().trim().required(),
            date_of_birth: Joi.string().trim().required(),
            address: Joi.string().trim().min(10).required(),
            city: Joi.string().trim().required(),
            state: Joi.string().trim().required(),
            pin_code: Joi.string().trim().required(),
            photo_id_proof: Joi.string().trim().optional(),
            photo_id_image: Joi.string().trim().optional(),
        })
        const {error} = schema.validate(req)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('kycValidation', error))
            )
        }
        return callback(true)
    },


    editProfileValidation: (req, res, callback) => {
        const requestObj = {
            first_name: Joi.string().trim().max(60).optional(),
            last_name: Joi.string().trim().max(60).optional(),
            address: Joi.string().trim().optional(),
            email: Joi.string().email().optional(),
            mobile: Joi.number().required(),
            image: Joi.string().allow('').trim().optional()
        };

        const schema = Joi.object(requestObj);
        const {error} = schema.validate(req);
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('editProfileValidation', error))
            );
        }
        return callback(true);
    },
    verifyNewMobileValidation: (req, res, callback) => {
        const schema = Joi.object({
            otp: Joi.string().required(),
            mobile_number: Joi.string().required(),
        })
        const {error} = schema.validate(req);
        if (error) {
            Response.validationErrorResponseData(res, res.__(Helper.validationMessageKey('verifyNewMobileValidation', error)));
        }
        return callback(true);
    },

    verifyNewEmailValidation: (req, res, callback) => {
        const schema = Joi.object({
            otp: Joi.string().required(),
            email: Joi.string().required(),
        })
        const {error} = schema.validate(req);
        if (error) {
            Response.validationErrorResponseData(res, res.__(Helper.validationMessageKey('verifyNewEmailValidation', error)));
        }
        return callback(true);
    },

    emailVerificationValidation: (req, res, callback) => {
        const schema = Joi.object({
            otp: Joi.string().required(),
            email: Joi.string().required(),
        })
        const {error} = schema.validate(req);
        if (error) {
            Response.validationErrorResponseData(res, res.__(Helper.validationMessageKey('emailVerificationValidation', error)));
        }
        return callback(true);
    },

    mobileVerificationValidation: (req, res, callback) => {
        const schema = Joi.object({
            otp: Joi.string().required(),
            mobile: Joi.string().required(),
        })
        const {error} = schema.validate(req);
        if (error) {
            Response.validationErrorResponseData(res, res.__(Helper.validationMessageKey('mobileVerificationValidation', error)));
        }
        return callback(true);
    },

    resendOTPValidation: (req, res, callback) => {
        const schema = Joi.object({
            type: Joi.string().valid('mobile', 'email').required(),
            mobile_number: Joi.string().optional(),
            email: Joi.string().optional(),
        })
        const {error} = schema.validate(req);
        if (error) {
            Response.validationErrorResponseData(res, res.__(Helper.validationMessageKey('resendOTPValidation', error)));
        }
        return callback(true);
    },

}
