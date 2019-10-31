const {messageProcessor} = require("../processors/MessageProcessor")

// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

// HTTP library to make HTTP requests to other containers
const axios = require('axios');

class MessageController {
    constructor() {

    }
    async getMessages(req, res) {
        try {
            var messages = await messageProcessor.getMessages();
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBMessageSearchError
            })
        }
        return res.status(200).send({
            data: {
                messages
            }
        })
    }
    async saveMessage(req, res) {
        axios.defaults.headers.get['Content-Type'] = 'application/json';
        axios.defaults.headers.get['token'] = req.header('token');
        axios.get('http://authentication:3000/api/authentication')
        .then(async response => {
            var user = response.data
            try {
                var message = await messageProcessor.addMessage({
                    name: user.name,
                    avatar: user.avatar,
                    text: req.body.text
                })
            } catch (error) {
                return res.status(errorCodes.mongoDBError).send({
                    error: errorMessages.mongoDBMessageSaveError
                })
            }
            return res.status(200).send({
                message
            })
        })
        .catch((error) => {
            return res.status(400).send(
                error
            )
        })
    }
}

exports.messageController = new MessageController();