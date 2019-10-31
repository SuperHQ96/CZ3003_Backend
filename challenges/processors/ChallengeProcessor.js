const { Challenge } = require("../models/challenge")

class ChallengeProcessor {
    constructor() {

    }
    getChallengeDAO(_id) {
        return Challenge.findOne({_id}).exec();
    }
    getChallengerChallengesDAO(challengerID) {
        return Challenge.find({challengerID}).exec();
    }
    getChallengeeChallengesDAO(challengeeID) {
        return Challenge.find({challengeeID}).exec();
    }
    saveChallengeDAO(json) {
        const newChallenge = new Challenge({
            challengerID: json.challengerID,
            challengeeID: json.challengeeID,
            challengerTiming: json.challengerTiming,
            challengerScore: json.challengerScore,
            questions: json.questions,
            challengerTimings: json.challengerTimings
        })
        return new Promise((resolve, reject) => {
            newChallenge
            .save((err, challenge) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(challenge);
                }
            })
        })
    }
    updateChallengeDAO(_id, json) {
        return new Promise((resolve, reject) => {
            Challenge
            .findOneAndUpdate(
                {_id},
                {$set: {
                    "challengeeTiming": json.challengeeTiming,
                    "challengeeScore": json.challengeeScore,
                    "challengeeTimings": json.challengeeTimings
                }},
                {new: true},
                (err, challenge) => {
                    if(err) {
                        reject(err)
                    } else {
                        resolve(challenge)
                    }
                }
            )
        })
    }
    deleteChallengeDAO(_id) {
        return new Promise((resolve, reject) => {
            Challenge
            .findOneAndDelete({_id}, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }
}

exports.challengeProcessor = new ChallengeProcessor();