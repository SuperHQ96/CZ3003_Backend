const axios = require('axios');
const { PORT, ENDPOINT } = require('./config');

global.users = require('./config').users
global.questions = require('./config').questions

axios.defaults.headers.post['Content-Type'] = 'application/json';

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


const injectData = async () => {
    // Sign up new users
    await new Promise((resolve, reject) => {
        var counter = 0;
        if(global.users.length > 0) {
            var users = Array.from(global.users);
            global.users.forEach(async (user) => {
                let { data } = await axios.post(`${ENDPOINT}:${PORT}/api/authentication`, user);
                users = users.map((mappedUser) => {
                    if(user.email === mappedUser.email) {
                        return {...user, token: data.token}
                    } else {
                        return mappedUser
                    }
                })
                counter++;
                if(counter == global.users.length) {
                    global.users = users
                    resolve();
                }
            })
        } else {
            resolve();
        }
    })

    // Enter questions
    await new Promise((resolve, reject) => {
        var counter = 0;
        var counter2 = 1;
        if(global.questions.length > 0) {
            global.questions.forEach(async (questionn) => {
                let user = global.users[Math.floor(Math.random()*global.users.length)];
                axios.defaults.headers.post['token'] = user.token
                counter2++;
                await sleep(2000*counter2);
                let { data } = await axios.post(`${ENDPOINT}:${PORT}/api/questions/save`, questionn)
                counter++;
                if(counter == global.questions.length) {
                    resolve();
                }
            })
        } else {
            resolve();
        }
    })

    console.log("Done")
}

injectData();