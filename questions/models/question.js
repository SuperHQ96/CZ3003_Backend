const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        required: true
    },
    choices: [String],
    correct: {
        type: Number,
        default: 0
    },
    topic: String,
    authorID: mongoose.Schema.Types.ObjectId,
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

const Question = mongoose.model('Question', QuestionSchema);

exports.Question = Question;