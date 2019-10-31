const {challengeController} = require('../controllers/ChallengeController');
const tokenAuth = require('../middlewares/tokenAuth');

module.exports = (route, app) => {
    app.route(route + '/')
    .get(tokenAuth, challengeController.getChallenge);

    app.route(route + '/challenger')
    .get(tokenAuth, challengeController.getChallengerChallenges);

    app.route(route + '/challengee')
    .get(tokenAuth, challengeController.getChallengeeChallenges);

    app.route(route + '/challenges')
    .get(tokenAuth, challengeController.getUserChallenges);

    app.route(route + '/save')
    .post(tokenAuth, challengeController.saveChallenge);

    app.route(route + '/update')
    .put(tokenAuth, challengeController.updateChallenge);

    app.route(route + '/')
    .delete(tokenAuth, challengeController.deleteChallenge);
}