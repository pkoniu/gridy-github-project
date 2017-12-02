const GitHub = require('github-api');
const cmdLineArgs = require('command-line-args');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');

const cmdLineArgsConf = require('./cmdLineConf');

const {login, password} = cmdLineArgs(cmdLineArgsConf);

const requestOptions = {
    url: `https://${login}:${password}@api.github.com/search/repositories?sort=stars&q=a&page=1&per_page=100`,
    headers: {
        'User-Agent': 'Gridy-Crawler'
    }
};

new Promise((resolve, reject) => {
    return request(requestOptions, (error, response, body) => {
        if(error) return reject(error);
        return resolve(body);
    });
}).then(body => {
    const bodyAsJson = JSON.parse(body);
    return _.map(bodyAsJson.items, item => {
        return {
            name: item.name,
            stars: item.stargazers_count,
            watchers: item.watchers_count,
            score: item.score,
            issues: item.open_issues_count,
            size: item.size,
            language: item.language
        };
    });
}).then(reposNames => {
    debugger;
    console.log(reposNames.length);
}).catch(error => {
    console.log(error);
});