const express = require('express');

module.exports = function(app) {
    app.use(express.json());
    require('../routes/authenticationRoute')('/api/authentication', app);
}
