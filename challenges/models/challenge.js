const mongoose = require('mongoose');

const QuestionTimingSchema = mongoose.Schema({
    questionID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timing: Number,
    correct: Boolean
})

const ChallengeSchema = mongoose.Schema({
    challengerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    challengeeID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    challengerTiming: Number,
    challengeeTiming: Number,
    challengerScore: Number,
    challengeeScore: Number,
    questions: [mongoose.Schema.Types.ObjectId],
    challengerTimings: [QuestionTimingSchema],
    challengeeTimings: [QuestionTimingSchema]
})

const Challenge = mongoose.model('Challenge', ChallengeSchema);

exports.Challenge = Challenge;