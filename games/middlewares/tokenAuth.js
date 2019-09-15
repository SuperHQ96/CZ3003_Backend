const jwt = require('jsonwebtoken');
// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

function tokenAuth(req, res, next) {
    // Read sent token from api request header
    const token = req.header('token');

    // If no token is provided, return with error number and message
    if (!token) return res.status(errorCodes.noTokenProvided).send(
        {
            'error': errorMessages.noAuthenticationTokenProvided
        }
    );

    try {
       const decodedPayload = jwt.verify(token, require('../config/pass').jwtPrivateKey);

        req.user = decodedPayload;

        next();

    }
    catch (ex) {

        res.status(errorCodes.invalidToken).send( { 'error': errorMessages.invalidAuthenticationToken } );

    }
}

module.exports = tokenAuth;