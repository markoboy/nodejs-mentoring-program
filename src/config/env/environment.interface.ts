import { ILoggerLevels } from '@core/logger';

export type INodeEnvironment = 'development' | 'production';

export interface IDatabaseEnvironment {
    pool: {
        min: number;
        max: number;
    };
    debug: boolean;
}

export interface IPostgresEnvironment {
    version?: string;
    host?: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
}

export interface ILogEnvironment {
    level: ILoggerLevels;
    path: string;
    console: boolean;
}

export interface IJWTEnvironment {
    secret: string;
    expires: string;
}

export interface IEnvironment {
    nodeEnv: INodeEnvironment;

    port: number;

    log: ILogEnvironment;

    db: IDatabaseEnvironment;

    pg: IPostgresEnvironment;

    jwt: IJWTEnvironment;
}
