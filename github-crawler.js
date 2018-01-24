const GitHub = require('github-api');
const cmdLineArgs = require('command-line-args');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const Bottleneck = require('bottleneck');

const MONGO_URL = 'mongodb://localhost:27017/bigtable';

const cmdLineArgsConf = require('./cmdLineConf').githubCrawler;

let db, githubResponse;

const GITHUB_SEARCH_WAIT_BETWEEN = 1000; //[ms]
const GITHUB_GET_WAIT_BETWEEN = 1000; //[ms]
const WANTED_RESULTS_AMOUNT = 200;
const GITHUB_PER_PAGE = 100;
const SEARCH_REQUESTS_AMOUNT = Math.ceil(WANTED_RESULTS_AMOUNT / GITHUB_PER_PAGE);

const githubSearchLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: GITHUB_SEARCH_WAIT_BETWEEN
});

const githubGetLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: GITHUB_GET_WAIT_BETWEEN
});

const {
    login,
    password
} = cmdLineArgs(cmdLineArgsConf);

const makeGitHubSearchRequest = (pageNo = 1) => {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            url: `https://${login}:${password}@api.github.com/search/repositories?sort=stars&q=a&page=${pageNo}&per_page=${GITHUB_PER_PAGE}`,
            headers: {
                'User-Agent': 'Gridy-Crawler'
            },
            json: true
        };

        console.log(`Requesting page no. ${pageNo}`);
        return request(requestOptions, (error, response, body) => {
            if (error) return reject(error);
            return resolve(body);
        });
    });
}

const makeGithubGetRequest = (ownerInfo) => {
    return new Promise((resolve, reject) => {
        console.log(`Requesting additional info for: ${ownerInfo.login}`);
        const requestDetails = {
            url: [ownerInfo.url.slice(0, 8), `${login}:${password}@`, ownerInfo.url.slice(8)].join(''),
            headers: {
                'User-Agent': 'Gridy-Crawler'
            },
            method: 'GET',
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
}

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

    const ids = new Array(SEARCH_REQUESTS_AMOUNT).fill();

    return Promise.all(ids.map((el, idx) => {
        const pageNo = idx + 1;
        console.log(`Scheduling search request no. ${pageNo}`);
        return githubSearchLimiter.schedule(makeGitHubSearchRequest, pageNo);
    }));
};

function saveReposDataToDB(allResponses) {
    process.exit(1);
    githubResponse = _.flatten(allResponses.map(el => el.items));
    console.log(`Received response from github, saving ${githubResponse.length} repositories data to mongo.`);

    const reposInfo = _.map(githubResponse, item => {
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
    console.log(`Inserted ${insertResult.insertedCount} repositories details.`);

    const ownersInfo = _.chain(githubResponse).map(item => {
        return {
            login: item.owner.login,
            url: item.owner.url,
            type: item.owner.type
        };
    }).uniqWith(_.isEqual).value();

    console.log(`Scheduling ${ownersInfo.length} additional info requests.`);
    return Promise.all(ownersInfo.map(ownerInfo => {
        console.log(`Scheduling getting additional info for ${ownerInfo.login}`);
        return githubGetLimiter.schedule(makeGithubGetRequest, ownerInfo);
    }));
};

function saveOwnersDataToDB(ownersWithAdditionalInfo) {
    console.log('Received data about owners');
    return db.collection('owners').insertMany(ownersWithAdditionalInfo);
};