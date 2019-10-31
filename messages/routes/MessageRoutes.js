const {messageController} = require('../controllers/MessageController');
const tokenAuth = require('../middlewares/tokenAuth');

module.exports = (route, app) => {
    app.route(route + '/')
    .get(tokenAuth, messageController.getMessages);

    app.route(route + '/save')
    .post(tokenAuth, messageController.saveMessage);
}