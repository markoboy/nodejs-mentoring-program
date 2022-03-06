const path = require('path');
const tsConfig = require('../tsconfig.json');

/**
 * Convert typescript alias paths to jest module name mapper.
 *
 * @returns {import('ts-jest/dist/types').InitialOptionsTsJest['moduleNameMapper']}
 */
function tsConfigToJestMapper() {
    const { paths } = tsConfig.compilerOptions;
    const keys = Object.keys(paths);

    return keys.reduce((accumulator, key) => {
        if (/\/\*$/.test(key)) {
            return accumulator;
        }

        const value = paths[key];
        accumulator[`^${key}$`] = `<rootDir>/${value}`;
        accumulator[`^${key}/(.*)$`] = `<rootDir>/${value}/$1`;

        return accumulator;
    }, {});
}

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    rootDir: path.resolve(__dirname, '..', 'src'),
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: tsConfigToJestMapper()
};
