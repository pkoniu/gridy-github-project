const cmdLineArgs = require('command-line-args');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:27017/bigtable';

let db, mappedReposData, mappedOwnersData;

const Bigtable = require('@google-cloud/bigtable');

const bigtable = new Bigtable({
    projectId: 'gridy-github',
    keyFilename: 'xD.json'
});
const instance = bigtable.instance('gridy-github');

const tableRepos = instance.table('repos');
const tableOwners = instance.table('owners');

const cmdLineArgsConf = require('./cmdLineConf');

return MongoClient.connect(MONGO_URL)
	.then((bigtableDB) => {
		db = bigtableDB
		return db.collection('repos').find().toArray();
	})
	.then((allReposData) => {
		return allReposData.map(element => {
			return {
				key: element._id.toString(),
				data: {
					general: {
						name: element.name,
						size: element.size,
						language: element.language
					},
					social:  {
						issues: element.issues,
						stars: element.stars,
						watchers: element.watchers,
						score: element.score
					}
				}
			}
		});
	})
	.then((mRD) => {
		mappedReposData = mRD;

		console.log(mappedReposData);

		return new Promise((resolve, reject) => {
			return tableRepos.insert(mappedReposData, function(err) {
				if(!err) {
					return resolve('!!!!!!');
				}
				return reject(err);
			});
		})
	})
	.then(() => {
		return db.collection('owners').find().toArray();
	})
	.then((allOwnersData) => {
		return allOwnersData.map(element => {
			return {
				key: element._id,
				data: {
					general: {
						login: element.login,
						url: element.url,
						type: element.type,
						public_repos: element.public_repos,
						public_gists: element.public_gists,
						followers: element.followers,
						following: element.following,
						created_at: element.created_at
					}
				}
			}
		});
	})
	.then((mOD) => {
		mappedOwnersData = mOD;

		return new Promise((resolve, reject) => {
			return tableOwners.insert(mappedOwnersData, function(err) {
  			if (!err) {
    			return resolve();
  			}
				return reject(err);
			});
		})
	})
	.then(xd => {
		console.log(xd);
	})
	.catch(error => {
		console.log(error);
		return db.close();
	})
