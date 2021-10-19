const tsConfig = require('../tsconfig.json');
const registerPaths = require('./register-paths');

// The base url for production is the outDir
const baseUrl = tsConfig.compilerOptions.outDir;

registerPaths(baseUrl);
