const Bigtable = require('@google-cloud/bigtable');

const bigtable = new Bigtable({
    projectId: 'gridy-github-bigtable',
    keyFilename: 'gridy-github-bigtable-59c836497151.json' 
});
const instance = bigtable.instance('bigtable-github');

const tableRepos = instance.table('repos');
const tableOwners = instance.table('owners');

const familyReposGeneral = tableRepos.family('general');
const familyReposSocial = tableRepos.family('social');
const familyOwnersGeneral = tableOwners.family('general');


new Promise((resolve, reject) => {
    return tableRepos.exists((error, exists) => {
        if(error) return reject(error);
        return resolve(exists);
    })
}).then(tableReposExists => {
    if(tableReposExists){
        return Promise.resolve([]);
    }
    return tableRepos.create();
}).then(data => {
    const tableRepos = data[0];
    const apiResponse = data[1];

    return new Promise((resolve, reject) => {
        return tableOwners.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(tableOwnersExists => {
    if(tableOwnersExists){
        return Promise.resolve([])
    }
    return tableOwners.create();
}).then(data => {
    const tableOwners = data[0];
    const apiResponse = data[1];

    return new Promise((resolve, reject) => {
        return familyReposGeneral.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(familyReposGeneralExists => {
    if(familyReposGeneralExists){
        return Promise.resolve([]);
    }
    return familyReposGeneral.create();
}).then(data => {
    const family = data[0];
    const apiResponse = data[1];

    return new Promise((resolve, reject) => {
        return familyReposSocial.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(familyReposSocialExists => {
    if(familyReposSocialExists){
        return Promise.resolve([]);
    }
    return familyReposSocial.create();
}).then(data => {
    const family = data[0];
    const apiResponse = data[1];

    return new Promise((resolve, reject) => {
        return familyOwnersGeneral.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(familyOwnersGeneralExists => {
    if(familyOwnersGeneralExists){
        return Promise.resolve([]);
    }
    return familyOwnersGeneral.create();
}).then(data => {
    const family = data[0];
    const apiResponse = data[1];
}).catch(console.log);