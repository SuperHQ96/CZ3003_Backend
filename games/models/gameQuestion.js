const mongoose = require('mongoose');

const GameQuestionSchema = mongoose.Schema({
    gameID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    questionID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timing: Number,
    correct: Number,
    time: {
        type: Date,
        default: Date.now
    }
})

const GameQuestion = mongoose.model('GameQuestion', GameQuestionSchema);

exports.GameQuestion = GameQuestion;