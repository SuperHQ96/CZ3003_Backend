const { Game } = require("../models/game");
const { GameQuestion } = require("../models/gameQuestion");
const { HiScore } = require("../models/hiscore");

class GameProcessor {
    constructor() {

    }
    getGameDAO(_id) {
        return Game.findOne({_id}).exec();
    }
    getGameQuestionsDAO(gameID) {
        return GameQuestion.find({gameID}).exec();
    }
    getPlayerQuestionHistory(playerID, questionID) {
        return GameQuestion.find({playerID, questionID}).sort({"time" : -1})
    }
    getUserHiScoresDAO(playerID) {
        return HiScore.find({playerID}).exec();
    }
    getQuestionHiScoreDAO(playerID, questionID) {
        return HiScore.find({playerID, questionID}).exec();
    }
    getGameHiScoresDAO(gameID) {
        return HiScore.find({gameID}).exec();
    }
    saveGameDAO(json) {
        const newGame = new Game({
            playerID: json.playerID,
            timing: json.timing,
            score: json.score
        })
        return new Promise((resolve, reject) => {
            newGame
            .save((err, game) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(game);
                }
            })
        })
    }
    saveGameQuestionDAO(json) {
        const newGameQuestion = new GameQuestion({
            gameID: json.gameID,
            questionID: json.questionID,
            timing: json.timing,
            correct: json.correct
        })
        return new Promise((resolve, reject) => {
            newGameQuestion
            .save((err, gameQuestion) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(gameQuestion);
                }
            })
        })
    }
    saveHiScoreDAO(json) {
        const newHiScore = new HiScore({
            playerID: json.playerID,
            questionID: json.questionID,
            gameID: json.gameID,
            score: json.score
        })
        return new Promise((resolve, reject) => {
            newHiScore
            .save((err, hiScore) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(hiScore);
                }
            })
        })
    }
    updateHiScoreDAO(playerID, questionID, gameID, score) {
        return new Promise((resolve, reject) => {
            HiScore
            .findOneAndUpdate(
                {playerID, questionID},
                {$set: {
                    "gameID": gameID,
                    "score": score
                }},
                {new: true},
                (err, hiScore) => {
                    if(err) {
                        reject(err)
                    } else {
                        resolve(hiScore)
                    }
                }
            )
        })
    }
    deleteGameDAO(_id) {
        return new Promise((resolve, reject) => {
            Game
            .findOneAndDelete({_id}, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }
    deleteGameQuestions(questionID) {
        return new Promise((resolve, reject) => {
            GameQuestion
            .deleteMany({questionID}, (err) => {
                if(err) {
                    reject(err)
                } else {
                    resolve();
                }
            })
        })
    }
    deleteQuestionHiScores(questionID) {
        return new Promise((resolve, reject) => {
            HiScore
            .deleteMany({questionID}, (err) => {
                if(err) {
                    reject(err)
                } else {
                    resolve();
                }
            })
        })
    }
    deletePlayerHiScoresDAO(playerID) {
        return new Promise((resolve, reject) => {
            HiScore
            .deleteMany({playerID}, (err) => {
                if(err) {
                    reject(err)
                } else {
                    resolve();
                }
            })
        })
    }
}

exports.gameProcessor = new GameProcessor();