export const getEnvNumber = (processProperty: string, n: number): number =>
    process.env[processProperty] ? Number(process.env[processProperty]) : n;

export const getEnvBoolean = (processProperty: string): boolean => process.env[processProperty] === 'true';
