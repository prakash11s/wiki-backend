const router = require('express').Router()

const {
    scoreBoardList
} = require('../../controllers/api/scoreBoardController');

// score board
router.get('/scoreboard', scoreBoardList);

module.exports = router
