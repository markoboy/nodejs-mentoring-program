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

export interface IEnvironment {
    nodeEnv: INodeEnvironment;

    port: number;

    db: IDatabaseEnvironment;

    pg: IPostgresEnvironment;
}
