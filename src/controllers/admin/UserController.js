const { Op } = require('sequelize');
const Transformer = require('object-transformer');
const Constants = require('../../services/Constants');
const { User } = require('../../models');
const Response = require('../../services/Response');
const {
  userChangeStatusValidation
} = require('../../services/AdminValidation');

module.exports = {

  userList: async (req, res) => {
    const requestParams = req.query;
    // eslint-disable-next-line no-unused-vars
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
        first_name: { [Op.like]: `%${requestParams.first_name}%` }
      };
    }
    if (requestParams.email && requestParams.email !== '') {
      search = true;
      query = {
        ...query,
        email: { [Op.like]: `%${requestParams.email}%` }
      };
    }
    if (requestParams.mobile && requestParams.mobile !== '') {
      search = true;
      query = {
        ...query,
        mobile: { [Op.like]: `%${requestParams.mobile}%` }
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
            status: { [Op.in]: requestParams.status }
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
    })
      .then(async (data) => {
        if (data.rows.length > 0) {
          const result = data.rows;

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
  },

  userUpdateStatus: async (req, res) => {
    const requestParams = req.fields;
    userChangeStatusValidation(requestParams, res, async (validate) => {
      if (validate) {
        await User
          .findOne({
            where: {
              id: requestParams.id
            }
          })
          .then(async (userData) => {
            if (userData) {
              // eslint-disable-next-line no-param-reassign
              userData.status = requestParams.status;
              userData
                .save()
                .then((result) => {
                  if (result) {
                    if (parseInt(requestParams.status, 10) === Constants.ACTIVE) {
                      Response.successResponseWithoutData(
                        res,
                        res.locals.__('UserStatusActivated'),
                        Constants.SUCCESS
                      );
                    }
                    else if (parseInt(requestParams.status, 10) === Constants.DELETE) {
                      Response.successResponseWithoutData(
                        res,
                        res.locals.__('UserDeleted'),
                        Constants.SUCCESS
                      );
                    }
                    else {
                      Response.successResponseWithoutData(
                        res,
                        res.locals.__('UserStatusDeactivated'),
                        Constants.SUCCESS
                      );
                    }
                  }
                })
                .catch(() => {
                  Response.errorResponseData(
                    res,
                    res.__('internalError'),
                    Constants.INTERNAL_SERVER
                  );
                });
            }
            else {
              return Response.successResponseWithoutData(
                res,
                res.locals.__('noDataFound'),
                Constants.SUCCESS
              );
            }
            return null;
          })
          .catch(() => {
            Response.errorResponseData(
              res,
              res.__('internalError'),
              Constants.INTERNAL_SERVER
            );
          });
      }
    });
  },

  /**
   * @description detail of user
   * @param req
   * @param res
   * */
  // eslint-disable-next-line consistent-return
  userDetail: async (req, res) => {
    const requestParams = req.params;
    if (requestParams.id === null) {
      Response.errorResponseData(
          res,
          res.__('invalidGroupId'),
          Constants.BAD_REQUEST
      );
    }
    else {
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
