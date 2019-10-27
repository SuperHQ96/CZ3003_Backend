const axios = require('axios');
const ENDPOINT_PORT = 'http://54.179.182.188:80'

describe('When not signed up', () => {
    test('Cannot log in', async () => {
        axios.post(`${ENDPOINT_PORT}/api/authentication/login`, {
            email: "blah@gmail.com",
            password: "12345678"
        })
        .catch(e => {
            expect(e.response.data.error).toBe('User with the email address does not exist')
        })
    })
    describe('And try to sign up', () => {
        test('Cannot sign up with a name already saved', async () => {
            axios.post(`${ENDPOINT_PORT}/api/authentication`, {
                "password": "12345678",
                "avatar": 2,
                "name": "HQ"
            })
            .catch(e => {
                expect(e.response.data.error).toBe('Name already saved')
            })
        })
        test('Cannot sign up with an email already saved', async () => {
            axios.post(`${ENDPOINT_PORT}/api/authentication`, {
                "email": "blah2@gmail.com",
                "password": "12345678",
                "avatar": 2,
                "name": "HQ"
            })
            .catch(e => {
                expect(e.response.data.error).toBe('Email already saved')
            })
        })
    })
})

describe('When logged in', () => {
    var token = "";
    beforeEach(async () => {
        let { data } = await axios.post(`${ENDPOINT_PORT}/api/authentication/login`, {
            email: "blah2@gmail.com",
            password: "12345678"
        })
        token = data.token
        axios.defaults.headers.get['Content-Type'] = 'application/json';
    });
    test('Can successfully get the user\'s details', async () => {
        axios.defaults.headers.get['token'] = token;
        let { data } = await axios.get(`${ENDPOINT_PORT}/api/authentication`)
        expect(data.email).toBe('blah2@gmail.com')
    })
})