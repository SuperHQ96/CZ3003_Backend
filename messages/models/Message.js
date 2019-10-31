const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    name: String,
    avatar: Number,
    text: String,
    time: {
        type: Date,
        default: Date.now
    }
})

const Message = mongoose.model('Message', MessageSchema);

exports.Message = Message;