const {authenticationController} = require('../controllers/authenticationController');
const tokenAuth = require('../middlewares/tokenAuth');

module.exports = (route, app) => {

    app.route(route + '/')
    .get(tokenAuth, authenticationController.getUser);

    app.route(route + '/random')
    .get(tokenAuth, authenticationController.getRandomUser);

    app.route(route + '/search')
    .get(tokenAuth, authenticationController.searchUser);

    app.route(route + '/user')
    .get(tokenAuth, authenticationController.getUserByID);

    app.route(route + '/')
    .post(authenticationController.signUp);

    app.route(route + '/login')
    .post(authenticationController.login)

    app.route(route + '/pinLogin')
    .post(authenticationController.pinLogin)

    app.route(route + '/newPin')
    .post(authenticationController.newPin);

    app.route(route + '/changePassword')
    .post(tokenAuth, authenticationController.changePassword);
}