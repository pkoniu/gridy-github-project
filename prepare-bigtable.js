const Bigtable = require('@google-cloud/bigtable');

const bigtable = new Bigtable({
    projectId: 'gridy-github-bigtable',
    keyFilename: 'gridy-github-bigtable-59c836497151.json' 
});
const instance = bigtable.instance('bigtable-github');

const tableRepos = instance.table('repos');
const tableOwners = instance.table('owners');


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
}).catch(console.log);
