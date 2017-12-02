const GitHub = require('github-api');
const cmdLineArgs = require('command-line-args');
const cmdLineArgsConf = require('./cmdLineConf');
const {login, password} = cmdLineArgs(cmdLineArgsConf);
console.log(login, password);
