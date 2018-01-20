module.exports = {
    githubCrawler: [{
        name: 'login',
        alias: 'l',
        type: String
    }, {
        name: 'password',
        alias: 'p',
        type: String
    }],
    newProject: [{
        name: 'key',
        alias: 'k',
        type: String
    }, {
        name: 'projectid',
        alias: 'p',
        type: String
    }, {
        name: 'name',
        alias: 'n',
        type: String
    }],
    saveToBigTable: [{
        name: 'projectId',
        alias: 'p',
        type: String
    }, {
        name: 'keyFile',
        alias: 'k',
        type: String
    }, {
        name: 'instanceName',
        alias: 'i',
        type: String
    }],
    prepareBigTable: [{
        name: 'projectId',
        alias: 'p',
        type: String
    }, {
        name: 'keyFile',
        alias: 'k',
        type: String
    }, {
        name: 'instanceName',
        alias: 'i',
        type: String
    }]
};
