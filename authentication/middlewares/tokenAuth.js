const jwt = require('jsonwebtoken');
// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

const { User } = require('../models/user');

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


        User.findOne({_id: req.user._id}).exec()
        .then((user) => {
            if(user) {
                next();
            } else {
                res.status(errorCodes.invalidToken).send({error: "User ID from token does not exist."})
            }
        })

    }
    catch (ex) {

        res.status(errorCodes.invalidToken).send( { 'error': errorMessages.invalidAuthenticationToken } );

    }
}

module.exports = tokenAuth;