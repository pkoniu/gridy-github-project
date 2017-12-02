const GitHub = require('github-api');
const cmdLineArgs = require('command-line-args');
const cmdLineArgsConf = require('./cmdLineConf');
const {login, password} = cmdLineArgs(cmdLineArgsConf);
console.log(login, password);

const request = require('request');

const requestOptions = {
    url: `https://${login}:${password}@api.github.com/search/repositories?sort=stars`
};

new Promise((resolve, reject) => {
    return request(requestOptions, (error, response, body) => {
        if(error) return reject(error);
        return resolve(body);
    });
}).then(body => {
    console.log(body);
}).catch(error => {
    console.log(error);
});