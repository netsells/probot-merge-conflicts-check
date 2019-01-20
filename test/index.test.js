const nock = require('nock');
// Requiring our app implementation
const myProbotApp = require('..');
const { Probot } = require('probot');

// Event response payloads

nock.disableNetConnect();

describe('Merge Conflict Checker', () => {
    let probot;

    beforeEach(() => {
        probot = new Probot({});
        // Load our app into probot
        const app = probot.load(myProbotApp);

        // just return a test token
        app.app = () => 'test';
    });
});
