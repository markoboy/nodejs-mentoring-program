const tsConfigPaths = require('tsconfig-paths');

const tsConfig = require('../tsconfig.json');

/**
 * Register alias paths from tsconfig.json file.
 *
 * @param {string} baseUrl The base url of the paths
 * @returns A clean up function to unregister paths
 */
module.exports = (baseUrl) => {
    return tsConfigPaths.register({
        baseUrl,
        paths: tsConfig.compilerOptions.paths
    });
};
