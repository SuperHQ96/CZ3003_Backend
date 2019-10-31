const mongoose = require('mongoose');

const TopicSchema = mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    statistics: {
        noOfCorrectAnswers: {
            type: Number,
            default: 0
        },
        noOfIncorrectAnswers: {
            type: Number,
            default: 0
        }
    }
})

const Topic = mongoose.model('Topic', TopicSchema);

exports.Topic = Topic;