const cmdLineArgs = require('command-line-args');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:27017/bigtable';

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
			return {
				key: element._id.toString(),
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
				key: element._id.toString(),
				data: {
					general: {
						login: element.login || 'N/A',
						url: element.url || 'N/A',
						type: element.type || 'N/A',
						public_repos: element.public_repos || 0,
						public_gists: element.public_gists || 0,
						followers: element.followers || 0,
						following: element.following || 0,
						created_at: element.created_at || 'N/A'
					}
				}
			}
		});
	})
	.then((mOD) => {
		mappedOwnersData = mOD;
		return tableOwners.insert(mappedOwnersData);
	})
	.then(xd => {
		console.log(`${mappedOwnersData.length} owners and ${mappedReposData.length} data inserted into ${instanceName} in ${projectId}`);
		return db.close();
	})
	.catch(error => {
		debugger;
		console.log(error);
		return db.close();
	})