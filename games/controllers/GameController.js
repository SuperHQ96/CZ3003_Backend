const {gameProcessor} = require("../processors/GameProcessor");

// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

// HTTP library to make HTTP requests to other containers
const axios = require('axios');

class GameController {
    constructor() {

    }

    async getGame(req, res) {
        try {
            var game = await gameProcessor.getGameDAO(req.query._id);
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBGameSearchError
            });
        }
        if(!game) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.gameNotFound
            })
        }
        try {
            var gameQuestions = await gameProcessor.getGameQuestionsDAO(game._id);
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBGameQuestionSearchError
            })
        }

        let questionIDs = [];

        gameQuestions.forEach((gameQuestion) => {
            if(gameQuestion) {
                questionIDs.append(gameQuestion.questionID)
            }
        })

        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.defaults.headers.post['token'] = req.header('token');
        axios.defaults.headers.post['intPass'] = process.env.internalPassword;

       axios.post('http://questions:5000/api/questions/getQuestions', {
            questionIDs
        })
        .then((response) => {
            return res.status(200).send({
                data: {
                    game,
                    questions: response.questions
                }
            })
        })
        .catch((error) => {
            return res.status(parseInt(error.message.replace( /^\D+/g, ''))).send(
                error.response.data
            )
        })

    }

    async getUserHiScores(req, res) {
        try {
            var hiScores = await gameProcessor.getUserHiScoresDAO(req.user._id);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBGameSearchError
            });
        }
        axios.defaults.headers.get['Content-Type'] = 'application/json';
        axios.defaults.headers.get['token'] = req.header('token');
        try {
            hiScores = hiScores.map(async (hiScore) => {
                let { data } = await axios.get(`http://questions:5000/api/questions?_id=${hiScore._id}`);
                return {
                    _id: hiScore._id,
                    question: data.question,
                    gameID: hiScore.gameID,
                    score: hiScore.score
                }
            })
        } catch (err) {
            return res.status(errorCodes.others).send({
                error: "Something went wrong while trying to get question information"
            })
        }

        return res.status(200).send({
            data: {
                hiScores
            }
        })
        
    }

    // Pass in questionID in req.query
    async getQuestionHistory(req, res) {
        if(!req.query.questionID) {
            res.status(errorCodes.incompleteData).send({
                error: "Please enter a questionID"
            })
        }
        try {
            var history = await gameProcessor.getPlayerQuestionHistory(req.user._id, req.query.questionID)
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBGameQuestionSearchError
            });
        }
        return res.status(200).send({
            data: {
                history
            }
        })
    }

    // req.body.gameTimings should be an array where each item
    // contains questionID, timing and correct fields
    async saveGame(req, res) {
        if(!Array.isArray(req.body.gameTimings)) {
            res.status(errorCodes.incompleteData).send({
                error: errorMessages.gameTimingsNotProvided
            })
        }
        let timing = 0;
        let score = 0;
        req.body.gameTimings.forEach((item) => {
            // First sum up total timing
            timing += item.timing
            // Next, calculate the score for each question
            // Afterwards, sum up all the scores to get a total
            score += calculateSingleScore(item)
        })
        try {
            // Save playerID, timing and score in a new game document
            var game = await gameProcessor.saveGameDAO({
                playerID: req.user._id,
                timing,
                score
            })
        } catch(err) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBGameSaveError
            })
        }
        let hiScore;
        req.body.gameTimings.forEach(async (item) => {
            let score = calculateSingleScore(item)
            // For each question, save a new gameQuestion document as well 
            // as check if there is a high score for the
            // player for this question.
            // If there is no high score, create a new high score record
            // and save the score just calculated as the high score as well
            // as the gameID.
            // If there is a high score, see if the newly calculated score
            // is higher than the previous high score. If it is, replace the
            // previous high score with the new score calculated and replace
            // the gameID as well.
            await gameProcessor.saveGameQuestionDAO({
                gameID: game._id,
                questionID: item.questionID,
                timing: item.timing,
                correct: item.correct
            })
            hiScore = await gameProcessor.getQuestionHiScoreDAO(req.user._id, item.questionID)
            if(!hiScore) {
                await gameProcessor.saveHiScoreDAO({
                    playerID: req.user._id,
                    questionID: item.questionID,
                    gameID: game._id,
                    score
                })
            } else {
                if(score >= hiScore.score) {
                    await gameProcessor.updateHiScoreDAO(req.user._id, item.questionID, game._id, score);
                }
            }
        })

        return res.status(200).send({
            data: {
                game
            }
        })
    }

    // Pass in game ID as req.query.gameID
    async deleteGame(req, res) {
        try {
            var game = await gameProcessor.getGameDAO(req.query.gameID)
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBGameSearchError
            })
        }
        if(!game) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.gameNotFound
            })
        }
        try {
            await gameProcessor.deleteGameDAO(req.query.gameID);
        } catch(err) {
            return res.status(errorCodes.mongoDBError).send({
                error: "Something went wrong while trying to delete game"
            })
        }
        return res.status(204).send({})
    }

}

function calculateSingleScore(item) {
    if(item.correct && item.timing <= 60) {
        return 100*(60 - item.timing)
    } else {
        return 0;
    }
}

function calculateScore(arr) {
    var score = 0
    arr.forEach((item) => {
        if(item.correct && item.timing <= 60) {
            score += 100*(60 - item.timing)
        }
    })
    return score
}

exports.gameController = new GameController();