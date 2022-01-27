/**
 * Naive implementation to convert a noun to singular.
 *
 * @param str The string to convert to singular
 * @returns The singular string
 */
export const toSingular = (str: string): string => str.replace(/s$/, '');

export const generateManyToManyModel = (modelName: string, relationName: string): string =>
    `${toSingular(modelName)}_${toSingular(relationName)}`;

export const generateModelId = (modelName: string): string => `${toSingular(modelName)}_id`;
