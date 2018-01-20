const cmdLineArgs = require('command-line-args');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:27017/bigtable2';

const cmdLineArgsConf = require('./cmdLineConf').saveToBigTable;

let db, mappedReposData, mappedOwnersData;

const Bigtable = require('@google-cloud/bigtable');

const {
	projectId,
	keyFile,
	instanceName
} = cmdLineArgs(cmdLineArgsConf);

const bigtable = new Bigtable({
	projectId,
	keyFilename: keyFile
});
const instance = bigtable.instance(instanceName);

const tableRepos = instance.table('repos');
const tableOwners = instance.table('owners');

return MongoClient.connect(MONGO_URL)
	.then((bigtableDB) => {
		db = bigtableDB
		return db.collection('repos').find().toArray();
	})
	.then((allReposData) => {
		return allReposData.map(element => {
			const _id = _.get(element, '_id', 'N/A');
			const name = _.get(element, 'name', 'N/A');
			const size = _.get(element, 'size', 0);
			const language = _.get(element, 'language', 'N/A');
			const issues = _.get(element, 'issues', 0);
			const stars = _.get(element, 'stars', 0);
			const watchers = _.get(element, 'watchers', 0);
			const score = _.get(element, 'score', 0);

			return {
				key: _id.toString(),
				data: {
					general: {
						name: element.name || 'N/A',
						size: element.size || 0,
						language: element.language || 'N/A'
					},
					social: {
						issues: element.issues || 0,
						stars: element.stars || 0,
						watchers: element.watchers || 0,
						score: element.score || 0
					}
				}
			};
		});
	})
	.then((mRD) => {
		mappedReposData = mRD;
		return tableRepos.insert(mappedReposData);
	})
	.then((response) => {
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
		debugger;
		mappedOwnersData = mOD;

		return new Promise((resolve, reject) => {
			return tableOwners.insert(mappedOwnersData, function (err) {
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
		debugger;
		console.log(error);
		return db.close();
	})