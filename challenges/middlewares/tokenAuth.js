const jwt = require('jsonwebtoken');
// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

// HTTP library to make HTTP requests to other containers
const axios = require('axios');

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

        axios.defaults.headers.get['Content-Type'] = 'application/json';
        axios.defaults.headers.get['token'] = req.header('token');
        axios
        .get(`http://authentication:3000/api/authentication`)
        .then((user) => {
            next();
        })
        .catch((error) => {
            res.status(errorCodes.invalidToken).send( { 'error': "User ID from token does not exist" } );
        })

    }
    catch (ex) {

        res.status(errorCodes.invalidToken).send( { 'error': errorMessages.invalidAuthenticationToken } );

    }
}

module.exports = tokenAuth;