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
    },
    json: true
};

return MongoClient.connect(MONGO_URL)
    .then(downloadDataFromGithub)
    .then(saveReposDataToDB)
    .then(requestAdditionalDataForOwners)
    .then(saveOwnersDataToDB)
    .then(insertResult => {
        console.log(`Inserted ${insertResult.insertedCount} owners data.`);
        return db.close();
    })
    .catch(error => {
        console.log(error);
        return db.close();
    });

function downloadDataFromGithub(bigtableDB) {
    console.log('Connected to bigtable-db in mongo.');
    console.log('Requesting data from github');

    db = bigtableDB;
    return new Promise((resolve, reject) => {
        return request(requestOptions, (error, response, body) => {
            if (error) return reject(error);
            return resolve(body);
        });
    });
};

function saveReposDataToDB(body) {
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
};

function requestAdditionalDataForOwners(insertResult) {
    console.log(`Inserted ${insertResult.insertedCount} repositories details.`)

    const ownersInfo = _.chain(githubResponse.items).map(item => {
        return {
            login: item.owner.login,
            url: item.owner.url,
            type: item.owner.type
        };
    }).uniq().value();

    return Promise.all(ownersInfo.map(ownerInfo => {
        return new Promise((resolve, reject) => {
            console.log(`Requesting additional info for: ${ownerInfo.login}`);
            const requestDetails = {
                url: ownerInfo.url,
                headers: {
                    'User-Agent': 'Gridy-Crawler'
                },
                json: true
            };
            return request(requestDetails, (error, response, body) => {
                if (error) return reject({
                    error,
                    ownerInfo
                });
                return resolve(_.merge(ownerInfo, {
                    public_repos: body.public_repos,
                    public_gists: body.public_gists,
                    followers: body.followers,
                    following: body.following,
                    created_at: body.created_at
                }));
            });
        });
    }));
};

function saveOwnersDataToDB(ownersWithAdditionalInfo) {
    console.log('Received data about owners');
    return db.collection('owners').insertMany(ownersWithAdditionalInfo);
};