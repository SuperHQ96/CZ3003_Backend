const mongoose = require('mongoose');

module.exports = function () {
    mongoose.connect('mongodb://mongo:27017/cz3003')
    .then(() => console.log('Connected to mongodb...'))
}