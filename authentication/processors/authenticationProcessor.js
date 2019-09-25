const { User } = require('../models/user');

class AuthenticationProcessor {

    constructor() {
        
    }
    
    getUserDAO(_id){
        return User.findOne({_id}).exec();
    }

    getUserByEmail(email) {
        return User.findOne({email}).exec();
    }

    getRandomUserDAO() {
        return User.aggregate([
            { $match: { admin: false }},
            { $sample : {size : 1}}
        ]).exec();
    }

    getUserByNameDAO(name) {
        return User.findOne({name}).exec();
    }

    saveUserDAO(json) {
        const newUser = new User({
            email: json.email,
            password: json.password,
            admin: json.admin,
            name: json.name? json.name : undefined
        })
        return new Promise((resolve, reject) => {
            newUser
            .save((err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            }) 
        })
    }

    updatePasswordDAO(_id, newPassword) {
        return new Promise((resolve, reject) => {
            User
            .findOneAndUpdate(
                {_id},
                { $set : {"password" : newPassword}},
                {new: true},
                (err, user) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                }
            )
        })
    }

    updatePinDAO(email, newPin) {
        return new Promise((resolve, reject) => {
            User
            .findOneAndUpdate(
                {email},
                { $set : {"pin" : newPin}},
                {new: true},
                (err, user) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                }
            )

        })
    }

    deleteUserDAO(_id) {
        return new Promise((resolve, reject) => {
            User
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

exports.authenticationProcessor = new AuthenticationProcessor()