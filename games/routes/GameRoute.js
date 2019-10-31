const {gameController} = require('../controllers/GameController');
const tokenAuth = require('../middlewares/tokenAuth');
const internalAuth = require('../middlewares/internalAuth');

module.exports = (route, app) => {
    app.route(route + '/')
    .get(tokenAuth, gameController.getGame);

    app.route(route + '/past')
    .get(tokenAuth, gameController.getUserGames);

    app.route(route + '/hiScores')
    .get(tokenAuth, gameController.getUserHiScores);

    app.route(route + '/history')
    .get(tokenAuth, gameController.getQuestionHistory);

    app.route(route + '/leaderboard')
    .get(tokenAuth, gameController.getLeaderBoard);

    app.route(route + '/save')
    .post(tokenAuth, gameController.saveGame);

    app.route(route + '/')
    .delete(tokenAuth, gameController.deleteGame);
}