const {questionController} = require('../controllers/QuestionController');
const tokenAuth = require('../middlewares/tokenAuth');
const internalAuth = require('../middlewares/internalAuth');

module.exports = (route, app) => {
    app.route(route + '/')
    .get(tokenAuth, questionController.getQuestion);

    app.route(route + '/userQuestions')
    .get(tokenAuth, questionController.getUserQuestions);

    app.route(route + '/sample')
    .get(tokenAuth, questionController.getSampleQuestions);

    app.route(route + '/getQuestions')
    .post(internalAuth, tokenAuth, questionController.getQuestions);

    app.route(route + '/save')
    .post(tokenAuth, questionController.saveNewQuestion);

    app.route(route + '/update')
    .put(tokenAuth, questionController.updateQuestion);

    app.route(route + '/correct')
    .put(tokenAuth, questionController.incrementCorrect);

    app.route(route + '/incorrect')
    .put(tokenAuth, questionController.incrementIncorrect);

    app.route(route + '/')
    .delete(tokenAuth, questionController.deleteQuestion);
}