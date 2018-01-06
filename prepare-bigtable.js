const Bigtable = require('@google-cloud/bigtable');

const bigtable = new Bigtable({
    projectId: 'gridy-github',
    keyFilename: 'xD.json'
});
const instance = bigtable.instance('gridy-github');

const tableRepos = instance.table('repos');
const tableOwners = instance.table('owners');

const familyReposGeneral = tableRepos.family('general');
const familyReposSocial = tableRepos.family('social');
const familyOwnersGeneral = tableOwners.family('general');


new Promise((resolve, reject) => {
    console.log("Checking if repos table exists...");
    return tableRepos.exists((error, exists) => {
        if(error) return reject(error);
        return resolve(exists);
    })
}).then(tableReposExists => {
    if(tableReposExists){
      console.log("Repos table exists");
        return Promise.resolve([]);
    }
    console.log("Creating repos table");
    return tableRepos.create();
}).then(data => {
    const tableRepos = data[0];
    const apiResponse = data[1];

    console.log("Repos table created.");
    return new Promise((resolve, reject) => {
      console.log("Checking if owners table exists...");
        return tableOwners.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(tableOwnersExists => {
    if(tableOwnersExists){
        console.log("Owners table exists");
        return Promise.resolve([])
    }
    console.log("Creating owners table");
    return tableOwners.create();
}).then(data => {
    const tableOwners = data[0];
    const apiResponse = data[1];

    console.log("Owners table created.");
    return new Promise((resolve, reject) => {
        console.log("Checking if repo general family exists...");
        return familyReposGeneral.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(familyReposGeneralExists => {
    if(familyReposGeneralExists){
        console.log("Repos general family exists");
        return Promise.resolve([]);
    }
    console.log("Creating repos general family...");
    return familyReposGeneral.create();
}).then(data => {
    const family = data[0];
    const apiResponse = data[1];

    console.log("Repos general family created.");
    return new Promise((resolve, reject) => {
      console.log("Checking if repos social family exists...");
        return familyReposSocial.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(familyReposSocialExists => {
    if(familyReposSocialExists){
        console.log("Repos social family exists");
        return Promise.resolve([]);
    }
    console.log("Creating repos social family...");
    return familyReposSocial.create();
}).then(data => {
    const family = data[0];
    const apiResponse = data[1];

    console.log("Repos social family created.");
    return new Promise((resolve, reject) => {
        console.log("Checking if owners general family exists...");
        return familyOwnersGeneral.exists((error, exists) => {
            if(error) return reject(error);
            return resolve(exists);
        })
    })
}).then(familyOwnersGeneralExists => {
    if(familyOwnersGeneralExists){
      console.log("Owners general family exists");
        return Promise.resolve([]);
    }
    console.log("Creating owners general family...");
    return familyOwnersGeneral.create();
}).then(data => {
    const family = data[0];
    const apiResponse = data[1];
    console.log("Owners general family created.");
}).catch(console.log);
