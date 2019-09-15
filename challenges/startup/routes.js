const express = require('express');

module.exports = function(app) {
    app.use(express.json());
    require('../routes/ChallengeRoute')('/api/challenges', app);
}