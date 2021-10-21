const tsConfig = require('../tsconfig.json');
const registerPaths = require('./register-paths');

// The base url for development is the baseUrl
const baseUrl = tsConfig.compilerOptions.baseUrl;

registerPaths(baseUrl);
