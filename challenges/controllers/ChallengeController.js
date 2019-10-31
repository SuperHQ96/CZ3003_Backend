const {challengeProcessor} = require("../processors/ChallengeProcessor");

// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

// HTTP library to make HTTP requests to other containers
const axios = require('axios');

class ChallengeController {
    constructor() {

    }

    async getChallenge(req, res) {
        try {
            var challenge = await challengeProcessor.getChallengeDAO(req.query._id);
            if(!challenge) {
                return res.status(errorCodes.notFound).send({
                    error: errorMessages.challengeNotFound
                })
            }
            return res.status(200).send({
                data: {
                    challenge
                }
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSearchError
            });
        }
    }
    async getChallengerChallenges(req, res) {
        try {
            var challenges = await challengeProcessor.getChallengerChallengesDAO(req.user._id);
            return res.status(200).send({
                data : {
                    challenges
                }
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSearchError
            });
        }
    }

    async getChallengeeChallenges(req, res) {
        try {
            var challenges = await challengeProcessor.getChallengeeChallengesDAO(req.user._id);
            return res.status(200).send({
                data : {
                    challenges
                }
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSearchError
            });
        }
    }

    async getUserChallenges(req, res) {
        try {
            var challenges = await challengeProcessor.getChallengerChallengesDAO(req.user._id);
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSearchError
            });
        }
        try {
            var challenges2 = await challengeProcessor.getChallengeeChallengesDAO(req.user._id);
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSearchError
            });
        }
        return res.status(200).send({
            data : {
                challengerChallenges: challenges,
                challengeeChallenges: challenges2
            }
        })
    }

    // req.body requires challengeeID and challengerTimings
    // req.body.challengerTimings should be an array where each item 
    // contains questionID, timing and correct fields
    async saveChallenge(req, res) {
        if(!req.body.challengeeID) {
            res.status(errorCodes.incompleteData).send({
                error: errorMessages.challengeeIDNotProvided
            })
        }
        if(!Array.isArray(req.body.challengerTimings)) {
            res.status(errorCodes.incompleteData).send({
                error: errorMessages.challengerTimingsNotProvided
            })
        }
        let challengerTiming = 0;
        let questions = []
        req.body.challengerTimings.forEach((timing) => {
            challengerTiming += timing.timing,
            questions.push(timing.questionID)
        })
        let challengerScore = calculateScore(req.body.challengerTimings);
        try {
            var challenge = await challengeProcessor.saveChallengeDAO({
                challengerID: req.user._id,
                challengeeID: req.body.challengeeID,
                challengerTiming,
                challengerScore,
                questions,
                challengerTimings: req.body.challengerTimings
            })
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSaveError
            });
        }
        if(!challenge) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.challengeNotSavedProperly
            })
        }
        axios.defaults.headers.put['Content-Type'] = 'application/json';
        axios.defaults.headers.put['token'] = req.header('token');
        axios.defaults.headers.put['intPass'] = process.env.internalPassword;
        await new Promise((resolve, reject) => {
            var counter = 0;
            if(req.body.challengerTimings.length > 0) {
                req.body.challengerTimings.forEach(async (item) => {
                    counter++;
                    if(item.correct) {
                        await axios.put('http://questions:5000/api/questions/correct', {
                            questionID: item.questionID
                        })
                    } else {
                        await axios.put('http://questions:5000/api/questions/incorrect', {
                            questionID: item.questionID
                        })
                    }
                    if(counter == req.body.challengerTimings.length) {
                        resolve();
                    }
                })
            } else {
                resolve()
            }
        })

        return res.status(200).send({
            challenge
        })
    }

    // req.body requires challengeeTimings and challengeID
    // req.body.challengeeTimings should be an array where each item 
    // contains questionID, timing and correct fields
    async updateChallenge(req, res) {
        try {
            var challenge = await challengeProcessor.getChallengeDAO(req.body.challengeID);
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSearchError
            });
        }
        if(!challenge) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.challengeNotFound
            })
        }
        let challengeeTiming = 0;
        req.body.challengeeTimings.forEach((timing) => {
            challengeeTiming += timing.timing
        })
        let challengeeScore = calculateScore(req.body.challengeeTimings);
        try {
            challenge = await challengeProcessor.updateChallengeDAO(req.body.challengeID, {
                challengeeTiming,
                challengeeScore,
                challengeeTimings: req.body.challengeeTimings
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeUpdateError
            });
        }
        if(!challenge) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.challengeNotSavedProperly
            })
        }

        axios.defaults.headers.put['Content-Type'] = 'application/json';
        axios.defaults.headers.put['token'] = req.header('token');
        axios.defaults.headers.put['intPass'] = process.env.internalPassword;
        await new Promise((resolve, reject) => {
            var counter = 0;
            if(req.body.challengeeTimings.length > 0) {
                req.body.challengeeTimings.forEach(async (item) => {
                    counter++;
                    if(item.correct) {
                        await axios.put('http://questions:5000/api/questions/correct', {
                            questionID: item.questionID
                        })
                    } else {
                        await axios.put('http://questions:5000/api/questions/incorrect', {
                            questionID: item.questionID
                        })
                    }
                    if(counter == req.body.challengeeTimings.length) {
                        resolve();
                    }
                })
            } else {
                resolve()
            }
        })

        return res.status(200).send({
            challenge
        })
    }
    async deleteChallenge(req, res) {
        try {
            var challenge = await challengeProcessor.getChallengeDAO(req.body.challengeID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBChallengeSearchError
            });
        }
        if(!challenge) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.challengeNotFound
            })
        }
        try {
            await challengeProcessor.deleteChallengeDAO(challenge._id);
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error : "Something went wrong when deleting challenge"
            });
        }

        return res.status(204).send({})
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

exports.challengeController = new ChallengeController();