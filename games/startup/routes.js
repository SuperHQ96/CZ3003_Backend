const express = require('express');

module.exports = function(app) {
    app.use(express.json());
    require('../routes/GameRoute')('/api/games', app);
}