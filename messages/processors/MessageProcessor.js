const { Message } = require("../models/Message");

class MessageProcessor {
    constructor() {

    }
    getMessages() {
        return Message.find({}).sort({"time" : -1}).exec();
    }
    addMessage(json) {
        const newMessage = new Message({
            name: json.name,
            avatar: json.avatar,
            text: json.text
        })
        return new Promise((resolve, reject) => {
            newMessage
            .save((err, message) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(message);
                }
            }) 
        })
    }
}

exports.messageProcessor = new MessageProcessor()