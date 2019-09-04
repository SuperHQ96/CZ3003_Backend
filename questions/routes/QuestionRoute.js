const {questionController} = require('../controllers/QuestionController');
const tokenAuth = require('../middlewares/tokenAuth');

module.exports = (route, app) => {
    app.route(route + '/')
    .get(tokenAuth, questionController.getQuestion);

    app.route(route + '/userQuestions')
    .get(tokenAuth, questionController.getUserQuestions);

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