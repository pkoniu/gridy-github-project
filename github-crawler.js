const GitHub = require('github-api');
const cmdLineArgs = require('command-line-args');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:27017/bigtable';

const cmdLineArgsConf = require('./cmdLineConf');

let db, githubResponse;

const {
    login,
    password
} = cmdLineArgs(cmdLineArgsConf);

const requestOptions = {
    url: `https://${login}:${password}@api.github.com/search/repositories?sort=stars&q=a&page=1&per_page=100`,
    headers: {
        'User-Agent': 'Gridy-Crawler'
    }
};

MongoClient.connect(MONGO_URL)
    .then(bigtableDB => {
        console.log('Connected to bigtable-db in mongo.');
        console.log('Requesting data from github');

        db = bigtableDB;
        return new Promise((resolve, reject) => {
            return request(requestOptions, (error, response, body) => {
                if (error) return reject(error);
                return resolve(JSON.parse(body));
            });
        });
    }).then(body => {
        console.log('Received reponse from github, saving to db.');
        githubResponse = body;

        const reposInfo = _.map(githubResponse.items, item => {
            return {
                name: item.name,
                issues: item.open_issues_count,
                size: item.size,
                language: item.language,
                stars: item.stargazers_count,
                watchers: item.watchers_count,
                score: item.score
            };
        });

        return db.collection('repos').insertMany(reposInfo);
    }).then(insertResult => {
        console.log(`Inserted ${insertResult.insertedCount} repositories details.`)
        process.exit(0);

        // const ownersInfo = _.chain(bodyAsJson.items).map(item => {
        // }).uniq().value();

    }).catch(error => {
        console.log(error);
    });