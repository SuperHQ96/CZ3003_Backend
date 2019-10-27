const { Topic } = require('../models/topic')

class TopicProcessor {
    constructor() {

    }
    getTopicDAO(_id) {
        return Topic.findOne({_id}).exec();
    }
    getTopicByNameDAO(topic) {
        return Topic.findOne({topic}).exec();
    }
    getAllTopicsDAO() {
        return Topic.find({}).exec();
    }
    saveTopicDAO(topic) {
        const newTopic = new Topic({
            topic
        })
        return new Promise((resolve, reject) => {
            newTopic
            .save((err, topic) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(topic);
                }
            })
        })
    }
    incrementTopicCorrectAnswersDAO(topic) {
        return new Promise((resolve, reject) => {
            Topic
            .findOneAndUpdate(
                {topic},
                {$inc: {"statistics.noOfCorrectAnswers": 1}},
                {new: true},
                (err, topic) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(topic);
                    }
                }
            )
        })
    }
    incrementTopicIncorrectAnswersDAO(topic) {
        return new Promise((resolve, reject) => {
            Topic
            .findOneAndUpdate(
                {topic},
                {$inc: {"statistics.noOfIncorrectAnswers": 1}},
                {new: true},
                (err, topic) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(topic);
                    }
                }
            )
        })
    }
    deleteTopicDAO(_id) {
        return new Promise((resolve, reject) => {
            Topic
            .findOneAndDelete({_id}, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }
    deleteTopicByNameDAO(topic) {
        return new Promise((resolve, reject) => {
            Topic
            .findOneAndDelete({topic}, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }
}

exports.topicProcessor = new TopicProcessor();