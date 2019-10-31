const express = require('express');

module.exports = function(app) {
    app.use(express.json());
    require('../routes/QuestionRoute')('/api/questions', app);
}