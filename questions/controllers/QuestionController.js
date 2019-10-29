const { questionProcessor } = require('../processors/QuestionProcessor');
const { topicProcessor } = require('../processors/TopicProcessor');

// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

class QuestionController {
    constructor() {

    }

    async getQuestion(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.query._id);
            if(!question) {
                return res.status(errorCodes.notFound).send({
                    error: errorMessages.questionNotFound
                })
            }
            return res.status(200).send({
                data: {
                    question
                }
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                    error : errorMessages.mongoDBQuestionSearchError
            });
        }
    }

    // Pass a list of questionIDs in req.body.questionIDs
    async getQuestions(req, res) {
        let questions = [];
        let question
        try {
            await new Promise((resolve, reject) => {
                var counter = 0;
                if(req.body.questionIDs.length > 0) {
                    req.body.questionIDs.forEach(async (ID) => {
                        question = await questionProcessor.getQuestionDAO(ID);
                        if(!question) {
                            questions.push(null)
                        } else {
                            questions.push(question)
                        }
                        counter++;
                        if(counter == req.body.questionIDs.length) {
                            resolve();
                        }
                    })
                } else {
                    resolve();
                }
            })
            
            return res.status(200).send({
                questions
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                    error : errorMessages.mongoDBQuestionSearchError
            });
        }
    }

    async getSampleQuestions(req, res) {
        try {
            var questions = await questionProcessor.getQuestionsSampleDAO(Number(req.query.number), Number(req.query.difficulty));
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBQuestionSearchError
            })
        }
        return res.status(200).send({
            data: {
                questions
            }
        })
    }

    async getUserQuestions(req, res) {
        try {
            var questions = await questionProcessor.getAllUserQuestionsDAO(req.user._id);
            return res.status(200).send({
                data : {
                    questions
                }
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                    error : errorMessages.mongoDBQuestionSearchError
            });
        }
    }

    async getTopicQuestions(req, res) {
        if(!req.query.topic) {
            return res.status(errorCodes.incompleteData).send({
                error: "Please enter a topic"
            })
        }
        try {
            var questions = await questionProcessor.getTopicQuestionsDAO(req.query.topic);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: "Something went wrong while trying to get topic questions"
            })
        }

        res.status(200).send({
            questions
        })
    }

    async saveNewQuestion (req, res) {
        if(!req.body.text) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionTextEntered
            })
        }
        if(!Number.isInteger(req.body.difficulty)) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionDifficulty
            })
        }
        if(!req.body.choices) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionChoices
            })
        }
        if(!req.body.correct && req.body.correct !== 0) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionCorrectOption
            })
        }
        if(!req.body.topic){
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionTopic
            })
        }
        if(req.body.correct < 0 | req.body.correct >= req.body.choices.length) {
            return res.status(errorCodes.invalidData).send({
                error: `Option out of bounds. Please enter a number from 0 to ${req.body.choices.length - 1}.` 
            })
        }

        try {
            var topic = await topicProcessor.getTopicByNameDAO(req.body.topic)
        } catch(err) {
            return res.status(errorCodes.mongoDBError).send({
                error: "Something went wrong while trying to search for topic."
            })
        }

        if(!topic) {
            try {
                topic = await topicProcessor.saveTopicDAO(req.body.topic)
            } catch(error) {
                return res.status(errorCodes.mongoDBError).send({
                    error : errorMessages.mongoDBTopicSaveError
                })
            }
        }

        try {
            var question = await questionProcessor.saveQuestionDAO({
                text: req.body.text,
                difficulty: req.body.difficulty,
                choices: req.body.choices,
                correct: req.body.correct,
                topic: req.body.topic,
                authorID: req.user._id
            })
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSaveError
            });
        }

        if(!question) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.questionNotSavedProperly
            })
        }

        return res.status(200).send({
            question
        })
    }

    async updateQuestion(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.questionID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }

        if(req.body.topic) {
            try {
                var topic = await topicProcessor.getTopicByNameDAO(req.body.topic)
            } catch(err) {
                return res.status(errorCodes.mongoDBError).send({
                    error: "Something went wrong while trying to search for topic."
                })
            }
    
            if(!topic) {
                try {
                    topic = await topicProcessor.saveTopicDAO(req.body.topic)
                } catch(error) {
                    return res.status(errorCodes.mongoDBError).send({
                        error : errorMessages.mongoDBTopicSaveError
                    })
                }
            }
        }

        if(req.body.topic !== question.topic) {
            try {
                var count = await questionProcessor.getTopicQuestionsCount(question.topic)
            } catch(error) {
                return res.status(errorCodes.mongoDBError).send({
                    error: "Something went wrong while trying to get count of all topic questions"
                })
            }
            if(count === 1) {
                try {
                    await topicProcessor.deleteTopicByNameDAO(question.topic)
                } catch(error) {
                    return res.status(errorCodes.mongoDBError).send({
                        error: "Something went wrong while trying to delete topic"
                    })
                }
            }
        }

        try {
            question = await questionProcessor.updateQuestionDAO(question._id, {
                text: (req.body.text) ? 
                    req.body.text : 
                    question.text,
                difficulty: (Number.isInteger(req.body.difficulty)) ?
                    req.body.difficulty :
                    question.difficulty,
                choices: (Array.isArray(req.body.choices) && req.body.choices.length > 0) ? 
                    req.body.choices : 
                    question.choices,
                correct: (Number.isInteger(req.body.correct)) ?
                    req.body.correct : 
                    question.correct,
                topic: (req.body.topic) ?
                    req.body.topic : 
                    question.topic
            })
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBQuestionSaveError
            })
        }

        return res.status(200).send({
            data: {
                question
            }
        })
    }

    async incrementCorrect(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.questionID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }
        try {
            question = await questionProcessor.incrementQuestionCorrectAnswersDAO(question._id);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBQuestionCorrectIncrementError
            })
        }
        try {
            await topicProcessor.incrementTopicCorrectAnswersDAO(question.topic);
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error: "Something went wrong while trying to increment topic's correct answer counts"
            })
        }

        return res.status(200).send({
            data: {
                question
            }
        })
    }

    async incrementIncorrect(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.questionID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }
        try {
            question = await questionProcessor.incrementQuestionIncorrectAnswersDAO(question._id);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBQuestionIncorrectIncrementError
            })
        }
        try{
            await topicProcessor.incrementTopicIncorrectAnswersDAO(question.topic)
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error: "Something went wrong while trying to increment topic's incorrect answer counts"
            })
        }

        return res.status(200).send({
            data: {
                question
            }
        })
    }

    async deleteQuestion(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.questionID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }
        try {
            var count = await questionProcessor.getTopicQuestionsCount(question.topic)
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error: "Something went wrong while trying to get count of all topic questions"
            })
        }
        if(count === 1) {
            try {
                await topicProcessor.deleteTopicByNameDAO(question.topic)
            } catch(error) {
                return res.status(errorCodes.mongoDBError).send({
                    error: "Something went wrong while trying to delete topic"
                })
            }
        }
        try {
            await questionProcessor.deleteQuestionDAO(question._id);
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error : "Something went wrong when deleting question"
            });
        }

        return res.status(204).send({})
    }
    async getAllTopics(req, res) {
        try{
            var topics = await topicProcessor.getAllTopicsDAO();
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error: "Something went wrong while trying to get all topics"
            })
        }
        return res.status(200).send({
            data: {
                topics
            }
        })
    }
}

exports.questionController = new QuestionController();