const { Op } = require('sequelize');
const Constants = require('../../services/Constants');
const { Scoreboard } = require('../../models');
const Response = require('../../services/Response')

module.exports = {
    /**
     * @description This function is get product list.
     * @param req
     * @param res
     */
    scoreBoardList: async (req, res) => {
        const request = req.query;
        let query = {};
        var current_date = new Date();
       
        if (request?.seven_day == 1) {
            query = {
                ...query,
                createdAt: {
                    [Op.and]: {
                      [Op.gte]:new Date(current_date.setDate(current_date.getDate() - 7)),
                      [Op.lte]:new Date()
                    }
                  }                
            }
        }else if(request?.one_day == 1){
            query = {
                ...query,
                createdAt: {
                    [Op.and]: {
                      [Op.gte]:new Date(current_date.setDate(current_date.getDate() - 1)),
                      [Op.lte]:new Date()
                    }
                  }                
            }
        }else if(request?.one_hour == 1){
            query = {
                ...query,
                createdAt: {
                    [Op.and]: {
                      [Op.gte]:new Date(current_date.setHours(current_date.getHours() - 1)),
                      [Op.lte]:new Date()
                    }
                  }                
            }
        }else if(request?.start_date != 'null' && request?.end_date != 'null'){
            query = {
                ...query,
                createdAt: {
                    [Op.and]: {
                      [Op.gte]:new Date(request?.start_date),
                      [Op.lte]:new Date(request?.end_date)
                    }
                  }                
            }
        }
        
        const score_board_list = await Scoreboard.findAll({
            attributes: ['id', 'run', 'batsman', 'score', 'wicket', 'over', 'createdAt'],
            where: query,
            distinct: true
        })
    
        if (score_board_list) {
            return Response.successResponseData(
                res,
                score_board_list,
                Constants.SUCCESS,
                res.locals.__('success')
            )
        } else {
            return Response.successResponseData(
                res,
                [],
                Constants.SUCCESS,
                res.locals.__('noScoreBoardFound')
            )
        }
    }

}
