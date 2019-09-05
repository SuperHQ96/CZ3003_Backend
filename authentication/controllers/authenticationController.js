const bcrypt = require('bcrypt');
const _ = require('lodash');
const nodemailer = require('nodemailer');

const {authenticationProcessor} = require('../processors/authenticationProcessor');

// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

class AuthenticationController {
    constructor() {

    }

    async getUser(req, res) {
        let user;
        try {
            user = await authenticationProcessor.getUserDAO(req.user._id);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).json({ 'error': errorMessages.mongoDBUserSearchError});
        }

        // If user not in database, return error
        if (!user) return res.status(errorCodes.userNotFound).json(
            {
                'error': errorMessages.userEmailNotInDB
            }
        );

        const data = _.pick(user, ['_id', 'email', 'admin', 'avatar', 'name']);

        res.status(200).json(data);
    }

    // req.body should have email, password and avatar 
    // Optional to have name
    async signUp(req, res) {
        try {
            var user = await authenticationProcessor.getUserByEmail(req.body.email);
        } catch(err) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBUserSearchError
            })
        }

        if(user) {
            return res.status(errorCodes.alreadyExist).send({
                error: errorMessages.userEmailAlreadyExist
            })
        }

        let password;
        let saltPW;
        saltPW = await bcrypt.genSalt();
        password = await bcrypt.hash(req.body.password, saltPW);

        try {
            user = await authenticationProcessor.saveUserDAO({
                email: req.body.email,
                password,
                admin: false,
                name: req.body.name? req.body.name : undefined
            })
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBUserSaveError
            })
        }

        let token;
        try {
            token = user.generateAuthToken();
        } catch(error) {
            return res.status(errorCodes.tokenGenerateError).send({
                error: errorMessages.authenticationTokenGenerateError
            })
        }

        const data = _.pick(user, ['_id', 'email', 'admin', 'avatar']);
        return res.status(200).send(
            {
                token,
                data
            }  
        );

    }

    async login(req, res) {

        if(!req.body.email | req.body.email === "") {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noEmailProvided
            })
        }

        if(!req.body.password | req.body.password === "") {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noPasswordProvided
            })
        }

        let user;
        try {
            user = await authenticationProcessor.getUserByEmail(req.body.email);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).json({ 'error': errorMessages.mongoDBUserSearchError});
        }

        // If user not in database, return error
        if (!user) return res.status(errorCodes.userNotFound).json(
            {
                'error': errorMessages.userEmailNotInDB
            }
        );

        // Validate password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        // if (!validPassword) return res.status(400).send('Invalid email or password');
        if (!validPassword) return res.status(errorCodes.invalidEmailOrPassword).json({ 'error': errorMessages.passwordIncorrect});

        let token;
        try {
            token = user.generateAuthToken();
        } catch(error) {
            return res.status(errorCodes.tokenGenerateError).send({
                error: errorMessages.authenticationTokenGenerateError
            })
        }

        const data = _.pick(user, ['_id', 'email', 'admin', 'avatar']);
        return res.status(200).send(
            {
                token,
                data
            }  
        );

    }

    async pinLogin (req, res) {
        if(!req.body.pin | req.body.pin === "") {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noPinProvided
            })
        }
        let user;
        try {
            user = await authenticationProcessor.getUserByEmail(req.body.email);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).json({ 'error': errorMessages.mongoDBUserSearchError});
        }

        // If user not in database, return error
        if (!user) return res.status(errorCodes.userNotFound).json(
            {
                'error': errorMessages.userEmailNotInDB
            }
        );

        // Check pin code validation
        const validPin = await bcrypt.compare(req.body.pin, user.pin);
        if(!validPin) {
            return res.status(errorCodes.invalidPin).json({ 'error': errorMessages.invalidPinCode});
        } else {
            try {
                user = await authenticationProcessor.updatePinDAO(req.body.email, '');
            } catch(error) {
                return res.status(errorCodes.mongoDBError).json({ 'error': "Something went wrong when trying to reset user's pin"});
            }
            let token;
            try {
                token = user.generateAuthToken();
            } catch(error) {
                return res.status(errorCodes.tokenGenerateError).send({
                    error: errorMessages.authenticationTokenGenerateError
                })
            }

            const data = _.pick(user, ['_id', 'email', 'admin', 'avatar']);
            return res.status(200).send(
                {
                    token,
                    data
                }  
            );
        }
    }

    async newPin(req, res) {

        if(!req.body.email | req.body.email === "") {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noEmailProvided
            })
        }

        let user;
        try {
            user = await authenticationProcessor.getUserByEmail(req.body.email);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).json({ 'error': errorMessages.mongoDBUserSearchError});
        }

        // If user not in database, return error
        if (!user) return res.status(errorCodes.userNotFound).json(
            {
                'error': errorMessages.userEmailNotInDB
            }
        );

        let pinCode = Math.floor(Math.random() * 10000);

        pinCode = String(pinCode).padStart(4, '0');

        const salt = await bcrypt.genSalt();
        const pinCrypt = await bcrypt.hash(pinCode, salt);

        try {
            user = await authenticationProcessor.updatePinDAO(req.body.email, pinCrypt);
        } catch(error) {
            return res
            .status(errorCodes.mongoDBError)
            .json({ 
                'error': "Something went wrong when trying to update user's pin"
            });
        }

        try {
            await sendPinEmail(user.email, user.name, pinCode);
        } catch (err) {
            return res.status(errorCodes.emailCouldNotBeSent).send({
                error: errorMessages.emailSendError
            })
        }

        return res.status(200).json({ 
            'message': 'PIN code sent'
        });

    }

    async changePassword(req, res) {
        let user;
        try {
            user = await authenticationProcessor.getUserDAO(req.user._id);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).json({ 'error': errorMessages.mongoDBUserSearchError});
        }

        // If user not in database, return error
        if (!user) return res.status(errorCodes.userNotFound).json(
            {
                'error': errorMessages.userEmailNotInDB
            }
        );

        if(!req.body.password) {
            return res.status(errorCodes.incompleteData).send({
                'error': errorMessages.noNewPasswordProvided
            })
        }

        let password;
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(req.body.password, salt);

        try {
            user = await authenticationProcessor.updatePasswordDAO(user._id, password);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: "something went wrong while trying to update user's password"
            })
        }

        const data = _.pick(user, ['_id', 'email', 'admin', 'avatar', 'name']);
        return res.status(200).send(
            {
                data
            }  
        );
    }

}

function sendPinEmail(emailAddress, name, pinCode) {

    // Remove this in production
    // if(emailAddress.indexOf("+") !== -1) {
    //     emailAddress = emailAddress.substring(0, emailAddress.indexOf("+")) + emailAddress.substring(emailAddress.indexOf("@"));
    // }

    return new Promise((resolve, reject) =>  {
        let emailBody = '<!DOCTYPE html>';
        emailBody += '<meta charset="utf-8">';
        emailBody += '<html><body style="background-color: #f1f2f2;">';
        emailBody += '<style>a:hover {color: #FFCC66 !important;}</style>'
        emailBody += '<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">'
        emailBody += '<h1 style="text-align:center; font-family: Arial, Helvetica, sans-serif; line-height: 40pt; color: #414042;"><b>Pin Code</b></h1>'
        emailBody += '<div class="container" style="color: #414042; margin-top: 25px; line-height: 20pt; font-family: Roboto Light, sans-serif; margin-left: auto; margin-right: auto; max-width: 800px; padding: 20px 0px; border-radius: 10px 10px; background-color: white;">'
        emailBody += '<div style="width:85%; margin:auto auto;">'
        emailBody += '<h6></h6>'
        emailBody += `<p>Hello ${name? name : ""}</p>`
        emailBody += `<p>Here is the pin code for your account:</p>`
        // emailBody += `<h2 style="font-family: Roboto Bold, sans-serif;"><b>${pinCode}</b></h2>`
        emailBody += '<h2 style="font-family: Roboto Bold, sans-serif;"><b>' + pinCode + '</b></h2>'
        emailBody += `<p>You're receiving this email because you recently requested for a pin code for your account. If this wasn't you, please ignore this email.</p>`
        emailBody += `<h6></h6>`
        emailBody += `<h6></h6>`
        emailBody += `</div>`
        emailBody += `</div>`
        emailBody += '</body></html>';
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                   user: 'cz3003cloud9@gmail.com',
                   pass: process.env.email_password
               }
           });
        let mailOptions = {
            from: 'CZ3003 Cloud9 Team',
            to: emailAddress,
            subject: 'PIN code request',
            html: emailBody
        };
        // Send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    })
    

};

exports.authenticationController = new AuthenticationController()