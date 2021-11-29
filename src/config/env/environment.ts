import dotenv from 'dotenv';
import path from 'path';

import { getEnvBoolean, getEnvNumber, getEnvString } from '@common/utils';

import { IEnvironment, INodeEnvironment } from './environment.interface';

const NODE_ENV = getEnvString<INodeEnvironment>('NODE_ENV', 'development');

export function loadEnv(): void {
    let envFile = '.dev.env';

    if (NODE_ENV === 'production') {
        envFile = '.env';
    }

    dotenv.config({ path: path.resolve(__dirname, envFile) });
}

export class Environment {
    static get(key: keyof IEnvironment): IEnvironment[typeof key];
    static get(): IEnvironment;
    static get(key?: keyof IEnvironment): IEnvironment | IEnvironment[keyof IEnvironment] {
        const env: IEnvironment = {
            nodeEnv: NODE_ENV,
            port: getEnvNumber('PORT', 3000),

            db: {
                pool: {
                    min: getEnvNumber('DB_POOL_MIN', 2),
                    max: getEnvNumber('DB_POOL_MAX', 10)
                },
                debug: getEnvBoolean('DB_DEBUG')
            },

            pg: {
                version: process.env.PG_VERSION,
                host: process.env.PG_HOST,
                port: getEnvNumber('PG_PORT', 5432),
                user: process.env.PG_USER,
                password: process.env.PG_PASSWORD,
                database: process.env.PG_DATABASE
            }
        };

        if (key) {
            return env[key];
        }

        return env;
    }
}