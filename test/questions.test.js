const axios = require('axios');
const ENDPOINT_PORT = 'http://54.179.182.188:80'

describe('When not logged in', () => {
    test('Cannot use API', async () => {
        axios.get(`${ENDPOINT_PORT}/api/questions/sample?number=10&difficulty=1`)
        .catch(e => {
            expect(e.response.data.error).toBe('No authentication token provided')
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
    test('Can get sample questions', async () => {
        axios.defaults.headers.get['token'] = token;
        let { data } = await axios.get(`${ENDPOINT_PORT}/api/questions/sample?number=10&difficulty=1`)
        expect(data.data.questions.length).toBe(10)
    })
})