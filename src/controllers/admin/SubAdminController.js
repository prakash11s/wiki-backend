const bcrypt= require('bcryptjs');
const Transformer = require('object-transformer');
const { Op } = require('sequelize');
const {
  ACTIVE, INACTIVE, FAIL, SUB_ADMIN, SUCCESS, INTERNAL_SERVER, PER_PAGE, BAD_REQUEST, DELETE
} = require('../../services/Constants');
const Response = require('../../services/Response');

const {
  subAdminDetail,
  modules
} = require('../../transformers/admin/AuthTransformer');
const {
  sequelize,
  Admin
} = require('../../models');
const {
  addEditValidationForSubAdmin,
  subAdminChangeStatusValidation
} = require('../../services/AdminValidation');

module.exports = {
  /**
   * @description Sub admin add-edit function
   * @param req
   * @param res
   */
  subAdminAddEdit: async (req, res) => {
    const requestParams = req.fields;
    // eslint-disable-next-line consistent-return
    addEditValidationForSubAdmin(requestParams, res, (validate) => {
      if (validate) {
        let checkEmailExist;
        if (requestParams.id) {
          checkEmailExist = Admin.findOne({
            where: {
              email: requestParams.email,
              id: {
                [Op.ne]: requestParams.id
              },
              status: {
                [Op.in]: [ACTIVE, INACTIVE]
              }
            }
          }).then();
        }
        else {
          checkEmailExist = Admin.findOne({
            where: {
              email: requestParams.email,
              status: {
                [Op.in]: [ACTIVE, INACTIVE]
              }
            }
          }).then();
        }
        // eslint-disable-next-line consistent-return
        checkEmailExist.then(async (adminData) => {
          if (adminData) {
            Response.successResponseWithoutData(
              res,
              res.__('EmailAlreadyExist'),
              FAIL
            );
          }
          else {
            const adminObj = {
              name: requestParams.name,
              type: SUB_ADMIN,
              status: requestParams.status
            };
            if (requestParams.id) {
              if (requestParams.password) {
                adminObj.password = bcrypt.hashSync(requestParams.password, 10);
              }

              Admin.findOne({
                where: {
                  id: requestParams.id,
                  status: {
                    [Op.in]: [ACTIVE, INACTIVE]
                  }
                }
              })
                .then(async (adminInfo) => {
                  if (adminInfo) {
                    await adminInfo
                      .update(adminObj, {
                        where: {
                          id: requestParams.id
                        }
                      })
                      .then(async (result) => {
                        if (result) {
                          return Response.successResponseWithoutData(
                            res,
                            res.locals.__('subAdminUpdated'),
                            SUCCESS
                          );
                        }
                        return null;
                      })
                      .catch(() => Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        INTERNAL_SERVER
                      ));
                  }
                  else {
                    return Response.successResponseWithoutData(
                      res,
                      res.__('SubAdminNotExist'),
                      FAIL
                    );
                  }
                  return null;
                })
                .catch(() => Response.errorResponseData(
                  res,
                  res.__('internalError'),
                  INTERNAL_SERVER
                ));
            }
            else {
              const t = await sequelize.transaction();
              adminObj.password = bcrypt.hashSync(requestParams.password, 10);
              adminObj.email = requestParams.email;
              await Admin.create(adminObj, { transaction: t })
                // eslint-disable-next-line consistent-return
                .then(async (result) => {
                  if (result) {
                    await t.commit();
                    return Response.successResponseWithoutData(
                      res,
                      res.locals.__('subAdminCreated'),
                      SUCCESS
                    );
                  }
                })
                .catch(async () => {
                  await t.rollback();
                  return Response.errorResponseData(
                    res,
                    res.__('internalError'),
                    INTERNAL_SERVER
                  );
                });
            }
          }
        });
      }
    });
  },

  /**
   * @description get list of all sub admin
   * @param req
   * @param res
   */

  subAdminList: async (req, res) => {
    const requestParams = req.query;
    const limit = requestParams.per_page && requestParams.per_page > 0
      ? parseInt(requestParams.per_page, 10)
      : PER_PAGE;
    const pageNo = requestParams.page && requestParams.page > 0
      ? parseInt(requestParams.page, 10)
      : 1;
    const offset = (pageNo - 1) * limit;

    let query = {
      [Op.and]: {
        status: {
          [Op.in]: [ACTIVE, INACTIVE]
        },
        type: SUB_ADMIN
      }
    };

    if (requestParams.search && requestParams.search !== '') {
      query = {
        ...query,
        [Op.or]: {
          firstName: {
            [Op.like]: `%${requestParams.search}%`
          },
          lastName: {
            [Op.like]: `%${requestParams.search}%`
          },
          email: {
            [Op.like]: `%${requestParams.search}%`
          },
          name: {
            [Op.like]: `%${requestParams.search}%`
          }
        }
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

    if (
      requestParams.filter_by_status
      && requestParams.filter_by_status !== ''
    ) {
      query = {
        ...query,
        [Op.and]: {
          status: requestParams.filter_by_status
        }
      };
    }

    if (
      requestParams.filter_by_createdAt
      && requestParams.filter_by_createdAt !== ''
    ) {
      query = {
        ...query,
        [Op.and]: {
          createdAt: requestParams.filter_by_createdAt
        }
      };
    }

    if (
      requestParams.filter_by_email
      && requestParams.filter_by_email !== ''
    ) {
      query = {
        ...query,
        [Op.and]: {
          email: requestParams.filter_by_email
        }
      };
    }

    Admin.findAndCountAll({
      where: query,
      order: sorting,
      offset,
      limit
    })
      .then((data) => {
        if (data.rows.length > 0) {
          const result = data.rows;
          const extra = [];
          extra.per_page = limit;
          extra.total = data.count;
          extra.page = pageNo;
          return Response.successResponseData(
            res,
            new Transformer.List(result, subAdminDetail).parse(),
            SUCCESS,
            res.locals.__('success'),
            extra
          );
        }
        return Response.successResponseData(
          res,
          [],
          SUCCESS,
          res.locals.__('noDataFound')
        );
      })
      .catch((error) => {
        console.log('error', error);
        Response.errorResponseData(
          res,
          res.__('internalError'),
          INTERNAL_SERVER
        );
      });
  },

  /**
   * @description change the status of sub admin
   * @param req
   * @param res
   */
  subAdminUpdateStatus: async (req, res) => {
    const requestParams = req.fields;
    // eslint-disable-next-line consistent-return
    subAdminChangeStatusValidation(requestParams, res, async (validate) => {
      if (validate) {
        await Admin.findOne({
          where: {
            id: requestParams.id
          }
        })
          .then(async (adminData) => {
            if (adminData) {
              /* eslint no-param-reassign: "error" */
              adminData.status = requestParams.status;
              await adminData
                .save()
                .then(async (result) => {
                  if (result) {
                    if (
                      parseInt(requestParams.status, 10) === ACTIVE
                    ) {
                      return Response.successResponseWithoutData(
                        res,
                        res.locals.__('SubAdminStatusActivated'),
                        SUCCESS
                      );
                    }
                    if (
                      parseInt(requestParams.status, 10) === INACTIVE
                    ) {
                      return Response.successResponseWithoutData(
                        res,
                        res.locals.__('SubAdminStatusDeactivated'),
                        SUCCESS
                      );
                    }
                    if (
                        parseInt(requestParams.status, 10) === DELETE
                    ) {
                      return Response.successResponseWithoutData(
                          res,
                          res.locals.__('SubAdminStatusDeleted'),
                          SUCCESS
                      );
                    }
                  }
                  return null;
                })
                .catch(() => Response.errorResponseData(
                  res,
                  res.__('internalError'),
                  INTERNAL_SERVER
                ));
            }
            else {
              return Response.successResponseWithoutData(
                res,
                res.locals.__('noSubAdminFound'),
                FAIL
              );
            }
            return null;
          })
          .catch(() => Response.errorResponseData(
            res,
            res.__('internalError'),
            INTERNAL_SERVER
          ));
      }
    });
  },

  /**
   * @description detail of sub admin
   * @param req
   * @param res
   * */
  // eslint-disable-next-line consistent-return
  subAdminDetail: async (req, res) => {
    const requestParams = req.params;
    if (requestParams.id === null) {
      Response.errorResponseData(
        res,
        res.__('invalidGroupId'),
        BAD_REQUEST
      );
    }
    else {
      await Admin.findOne({
        where: {
          id: requestParams.id,
          type: SUB_ADMIN,
          status: {
            [Op.in]: [ACTIVE, INACTIVE]
          }
        }
      })
        .then(async (result) => {
          if (result) {
            return Response.successResponseData(
              res,
              new Transformer.Single(result, subAdminDetail).parse(),
              SUCCESS,
              res.locals.__('success'),
              null
            );
          }

          return Response.successResponseWithoutData(
            res,
            res.locals.__('noDataFound'),
            FAIL
          );
        })
        .catch(() => {
          Response.errorResponseData(
            res,
            res.__('internalError'),
            INTERNAL_SERVER
          );
        });
    }
  },
};
