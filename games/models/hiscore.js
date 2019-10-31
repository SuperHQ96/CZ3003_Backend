const mongoose = require('mongoose');

const HiScoreSchema = mongoose.Schema({
    playerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    questionID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    gameID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    score: Number
})

const HiScore = mongoose.model('HiScore', HiScoreSchema);

exports.HiScore = HiScore;