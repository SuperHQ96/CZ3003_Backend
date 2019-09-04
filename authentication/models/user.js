const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true
    },
    avatar: {
        type: Number,
        default: 0
    },
    pin: {
        type: String,
        required: false,
        minLength: 4,
        maxLength: 4
    }
})

userSchema.methods.generateAuthToken = function (){
    const token = jwt.sign({_id: this._id, admin: this.isAdmin}, require('../config/pass').jwtPrivateKey);
    return token;
};

const User = mongoose.model('User', userSchema);

function validateAvatarNo(no) {
    const schema = {
        avatar: joi.number().min(0).max(2)
    }
    return Joi.validate({avatar: no}, schema)
}

exports.User = User;
exports.validateAvatarNo = validateAvatarNo;