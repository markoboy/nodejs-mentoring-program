export const getEnvNumber = (processProperty: string, n: number): number =>
    process.env[processProperty] ? Number(process.env[processProperty]) : n;

export const getEnvString = <T extends string>(processProperty: string, value: T): T =>
    process.env[processProperty] ? (process.env[processProperty] as T) : value;

export const getEnvBoolean = (processProperty: string): boolean => process.env[processProperty] === 'true';
