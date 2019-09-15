// Load error codes
const { errorCodes } = require('../config/errorCodes');

function internalAuth(req, res, next) {
    // Check if header includes intPass (internal password)
    const intPass = req.header('intPass');
    if(!intPass) {
        return res.status(errorCodes.others).send({'error': "No internal password provided"})
    }
    else {
        if(intPass != process.env.internalPassword) {
            return res.status(errorCodes.others).send({
                'error' : "Invalid internal password provided"
            })
        } else {
            next();
        }
    }
}

module.exports = internalAuth;