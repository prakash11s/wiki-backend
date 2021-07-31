const Response = require('./Response')
const Joi = require('@hapi/joi')
const Helper = require('./Helper')
const Constants = require('../services/Constants')

module.exports = {

  loginValidation: (req, res, callback) => {
    const schema = Joi.object({
      email: Joi.string().trim().email().max(150).required(),
      password: Joi.string().trim().required()
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('loginValidation', error))
      )
    }
    return callback(true)
  },

  forgotPasswordValidation: (req, res, callback) => {
    const schema = Joi.object({
      email: Joi.string().trim().email().max(150).required()
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('forgotPasswordValidation', error))
      )
    }
    return callback(true)
  },

  changePasswordValidation: (req, res, callback) => {
    const schema = Joi.object().keys({
      old_password: Joi.string().trim().required(),
      password: Joi.string()
        .trim()
        .min(6)
        .required()
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('changePassword', error))
      )
    }
    return callback(true)
  },

  addEditValidationForLabAdmins: (req, res, callback) => {
    const schema = Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().trim().required(),
      email: Joi.string().trim().email().max(150).required(),
      country_code: Joi.string().valid().required(),
      mobile: Joi.number().valid().min(10).required(),
      address: Joi.string().trim().required(),
      latitude: Joi.optional().allow(''),
      longitude: Joi.optional().allow('')
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('addEditValidationForLabAdminsValidation', error))
      )
    }
    return callback(true)
  },

  cmsEditValidation: (req, res, callback) => {
    const schema = Joi.object().keys({
      id: Joi.number().integer().required(),
      title: Joi.string().trim().max(70).required(),
      description: Joi.string().trim().required()
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('cmsEditValidation', error))
      )
    }
    return callback(true)
  },

  LabAdminChangeStatusValidation: (req, res, callback) => {
    const schema = Joi.object().keys({
      status: Joi.number()
        .valid(Constants.DELETE, Constants.INACTIVE, Constants.ACTIVE)
        .required(),
      ids: Joi.string().regex(/[0-9]$/)
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('LabAdminUpdateStatus', error))
      )
    }
    return callback(true)
  },

  addEditValidationForFaq: (req, res, callback) => {
    const schema = Joi.object({
      question: Joi.string().trim().required(),
      answer: Joi.string().trim().required(),
      id: Joi.number().optional().allow('')
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('addEditValidationForFaq', error))
      )
    }
    return callback(true)
  },

  statusChangeValidationForFaq: (req, res, callback) => {
    const schema = Joi.object({
      ids: Joi.string().regex(/[0-9]$/),
      status: Joi.number().required().valid(Constants.ACTIVE, Constants.INACTIVE, Constants.DELETE)
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('statusChangeValidationForFaq', error))
      )
    }
    return callback(true)
  },

  symptomsValidation: (req, res, callback) => {
    const schema = Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().trim().required(),
      image: Joi.string().allow('').trim(),
      description: Joi.string().trim().required(),
      symptoms_status: Joi.number().valid(
        Constants.HEALTH_STATUS.POSITIVE,
        Constants.HEALTH_STATUS.NEGATIVE
      ).required()
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('SymptomsValidation', error))
      )
    }
    return callback(true)
  },

  changeStatusValidationForSymptoms: (req, res, callback) => {
    const schema = Joi.object({
      ids: Joi.string().regex(/[0-9]$/),
      status: Joi.number().required().valid(Constants.ACTIVE, Constants.INACTIVE, Constants.DELETE)
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('statusChangeValidationForSymptoms', error))
      )
    }
    return callback(true)
  },

  latestUpdateValidation: (req, res, callback) => {
    const schema = Joi.object({
      id: Joi.number().optional().allow(''),
      title: Joi.string().trim().max(200).required(),
      image: Joi.string().allow('').trim(),
      link: Joi.string().trim().allow(''),
      description: Joi.string().trim().required(),
      image_type: Joi.string().optional().allow('')
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('latestUpdateValidation', error))
      )
    }
    return callback(true)
  },

  statusChangeValidationForLatestUpdate: (req, res, callback) => {
    const schema = Joi.object({
      ids: Joi.string().regex(/[0-9]$/).required(),
      status: Joi.number().required().valid(Constants.ACTIVE, Constants.INACTIVE, Constants.DELETE)
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('statusChangeValidationForLatestUpdate', error))
      )
    }
    return callback(true)
  },

  HealthTipsValidation: (req, res, callback) => {
    const schema = Joi.object({
      id: Joi.number().optional(),
      advice: Joi.string().trim().required(),
      symptoms_status: Joi.number().required().valid(
        Constants.HEALTH_STATUS.POSITIVE,
        Constants.HEALTH_STATUS.NEGATIVE)
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('healthTipsValidation', error))
      )
    }
    return callback(true)
  },

  changeStatusValidationForHealthTips: (req, res, callback) => {
    const schema = Joi.object({
      ids: Joi.string().regex(/[0-9]$/),
      status: Joi.number().required().valid(Constants.ACTIVE, Constants.INACTIVE, Constants.DELETE)
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('statusChangeValidationHealthTips', error))
      )
    }
    return callback(true)
  },

  updateUserHealthStatusValidation: (req, res, callback) => {
    console.log('==============', req)
    const schema = Joi.object({
      user_id: Joi.number().required(),
      health_status: Joi.number().valid(
        Constants.HEALTH_STATUS.POSITIVE,
        Constants.HEALTH_STATUS.NEGATIVE
      ).required(),
      barcode: Joi.required().disallow('')
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('updateUserHealthStatusValidation', error))
      )
    }
    return callback(true)
  },

  editSupportValidation: (req, res, callback) => {
    const schema = Joi.object({
      email: Joi.string().trim().email().required(),
      mobile: Joi.number().valid().required(),
      address: Joi.string().trim().required(),
      latitude: Joi.number().valid().required(),
      longitude:Joi.number().valid().required(),
    })
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('editSupportValidation', error))
      )
    }
    return callback(true)
  },

  addEditValidationForSubAdmin: (req, res, callback) => {
    const requestObj = {
      id: Joi.string().optional(),
      name: Joi.string().trim().required(),
      email: Joi.string().trim().email().max(150)
          .required(),
      status: Joi.number()
          .valid(Constants.ACTIVE, Constants.INACTIVE)
          .required(),
      password: Joi.string().trim().min(6)
          .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
          .required()
    };

    const schema = Joi.object(requestObj);
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
          res,
          res.__(Helper.validationMessageKey('addEditAdminValidation', error))
      );
    }
    return callback(true);
  },

  subAdminChangeStatusValidation: (req, res, callback) => {
    const schema = Joi.object().keys({
      status: Joi.number()
          .valid(Constants.ACTIVE, Constants.INACTIVE, Constants.DELETE)
          .required(),
      id: Joi.number().required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
          res,
          res.__(Helper.validationMessageKey('subAdminUpdateStatus', error))
      );
    }
    return callback(true);
  },

  userChangeStatusValidation: (req, res, callback) => {
    const schema = Joi.object().keys({
      status: Joi.number()
          .valid(Constants.DELETE, Constants.ACTIVE, Constants.INACTIVE)
          .required(),
      ids: Joi.string().regex(/[0-9]$/)
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
          res,
          res.__(Helper.validationMessageKey('userUpdateStatus', error))
      );
    }
    return callback(true);
  },

  addEditValidationForUser: (req, res, callback) => {
    const schema = Joi.object({
      id: Joi.string().optional(),
      name: Joi.string().max(100).trim().required(),
      email: Joi.string().max(100).trim().required(),
      mobile: Joi.string().min(5).max(15).required(),
      gender: Joi.number().valid(GENDER.MALE, GENDER.FEMALE, GENDER.OTHER).required(),
      platform: Joi.number().valid(PLATFORM.WEBSITE, PLATFORM.ANDRIOD, PLATFORM.IOS)
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
          res,
          res.__(Helper.validationMessageKey('addEditUserValidation', error))
      );
    }
    return callback(true);
  },


  KYCStatusUpdateValidation: (req, res, callback) => {
    const schema = Joi.object().keys({
      kyc_status : Joi.number().valid(Constants.VERIFIED, Constants.NOT_VERIFIED).required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
          res,
          res.__(Helper.validationMessageKey('KYCStatusUpdateValidation', error))
      );
    }
    return callback(true);
  },

}
