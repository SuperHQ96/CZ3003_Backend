const mongoose = require('mongoose');

const GameSchema = mongoose.Schema({
    playerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timing: Number,
    score: Number,
})

const Game = mongoose.model('Game', GameSchema);

exports.Game = Game;