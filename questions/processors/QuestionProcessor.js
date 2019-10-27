const { Question } = require('../models/question')

class QuestionProcessor {
    constructor() {

    }

    getQuestionDAO(_id) {
        return Question.findOne({_id}).exec();
    }

    getAllUserQuestionsDAO(userID) {
        return Question.find({authorID: userID}).exec();
    }

    getQuestionsSampleDAO(number, difficulty){
        return Question.aggregate([
            {$match: {difficulty: difficulty}},
            {$sample: {size : number}}
        ]).exec();
    }

    getTopicQuestionsCount(topic) {
        return Question.find({topic}).count().exec();
    }

    saveQuestionDAO(json) {
        const newQuestion = new Question({
            text: json.text,
            difficulty: json.difficulty,
            choices: json.choices,
            correct: json.correct,
            topic: json.topic,
            authorID: json.authorID
        })
        return new Promise((resolve, reject) => {
            newQuestion
            .save((err, question) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(question);
                }
            })
        })
    }

    updateQuestionDAO(_id, json) {
        return new Promise((resolve, reject) => {
            Question
            .findOneAndUpdate(
                {_id},
                { $set : {
                    "text" : json.text,
                    "dificulty" : json.difficulty,
                    "choices" : json.choices,
                    "correct" : json.correct,
                    "topic" : json.topic
                }},
                {new: true},
                (err, question) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(question);
                    }
                }
            )
        })
    }

    incrementQuestionCorrectAnswersDAO(_id) {
        return new Promise((resolve, reject) => {
            Question
            .findOneAndUpdate(
                {_id},
                {$inc: {"statistics.noOfCorrectAnswers": 1}},
                {new:true},
                (err, question) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(question);
                    }
                }
            )
        })
    }

    incrementQuestionIncorrectAnswersDAO(_id) {
        return new Promise((resolve, reject) => {
            Question
            .findOneAndUpdate(
                {_id},
                {$inc: {"statistics.noOfIncorrectAnswers": 1}},
                {new:true},
                (err, question) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(question);
                    }
                }
            )
        })
    }

    deleteQuestionDAO(_id) {
        return new Promise((resolve, reject) => {
            Question
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

exports.questionProcessor = new QuestionProcessor();