import dotenv from 'dotenv';
import path from 'path';

import { getEnvBoolean, getEnvNumber, getEnvString } from '@common/utils';

import { IEnvironment, INodeEnvironment } from './environment.interface';
import { BadRequestException } from '@common/exceptions';
import { ILoggerLevels } from '@core/logger';

const NODE_ENV = getEnvString<INodeEnvironment>('NODE_ENV', 'development');

type KeyType = keyof IEnvironment;

type ObjectType<T = unknown> = T extends KeyType ? IEnvironment[T] : IEnvironment;

function getEnv(): IEnvironment {
    return {
        nodeEnv: NODE_ENV,
        port: getEnvNumber('PORT', 3000),

        log: {
            level: getEnvString<ILoggerLevels>('LOG_LEVEL', 'info'),
            path: path.resolve(process.cwd(), getEnvString('LOG_PATH', 'logs')),
            console: getEnvBoolean('LOG_CONSOLE')
        },

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
}

export class Environment {
    private static loaded: boolean;

    private static env: IEnvironment;

    static load(): void {
        let envFile = '.dev.env';

        if (NODE_ENV === 'production') {
            envFile = '.env';
        }

        dotenv.config({ path: path.resolve(process.cwd(), envFile) });

        this.env = getEnv();

        this.loaded = true;
    }

    static get<T extends KeyType>(key: T): ObjectType<T>;
    static get(): ObjectType;
    static get<T extends KeyType>(key?: T): ObjectType<T> {
        if (!this.loaded) {
            throw new BadRequestException('Please load the environment by calling `Environment.load()`!');
        }

        if (key) {
            return this.env[key] as ObjectType<T>;
        }

        return this.env as ObjectType<T>;
    }
}
