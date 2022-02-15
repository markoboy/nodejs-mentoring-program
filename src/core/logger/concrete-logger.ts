import path from 'path';
import winston from 'winston';
import { ILoggerLogMethod } from '.';
import { ILogger, ILoggerLevels } from './logger.interface';

export interface IConcreteLoggerOptions {
    level?: ILoggerLevels;
    format?: winston.LoggerOptions['format'];
    silent?: boolean;
    logPath: string;
    useConsole: boolean;
}

export class ConcreteLogger implements ILogger {
    private readonly logger: winston.Logger;

    constructor(options: IConcreteLoggerOptions) {
        const { combine, json, timestamp } = winston.format;

        const { level = 'info', format = combine(timestamp(), json()), silent, logPath, useConsole } = options;

        const consoleTransport = new winston.transports.Console({ level, format });
        const errorTransport = new winston.transports.File({
            filename: path.resolve(logPath, 'error', 'error.log'),
            level: 'error'
        });
        const infoTransport = new winston.transports.File({
            filename: path.resolve(logPath, 'activity', 'activity.log'),
            level: 'http',
            format: winston.format((info) => {
                if (info.level !== 'error') {
                    return info;
                }

                return false;
            })()
        });

        const transports: winston.transport[] = [errorTransport, infoTransport];

        if (useConsole) {
            transports.unshift(consoleTransport);
        }

        this.logger = winston.createLogger({
            levels: winston.config.npm.levels,
            level,
            format,
            transports,
            silent
        });
    }

    error(...args: Parameters<ILoggerLogMethod>): void {
        this.logger.log('error', ...(args as [never]));
    }

    warn(...args: unknown[]): void {
        this.logger.log('warn', ...(args as [never]));
    }

    info(...args: unknown[]): void {
        this.logger.log('info', ...(args as [never]));
    }

    http(...args: unknown[]): void {
        this.logger.log('http', ...(args as [never]));
    }

    verbose(...args: unknown[]): void {
        this.logger.log('verbose', ...(args as [never]));
    }

    debug(...args: unknown[]): void {
        this.logger.log('debug', ...(args as [never]));
    }

    silly(...args: unknown[]): void {
        this.logger.log('silly', ...(args as [never]));
    }

    profile(id: string | number, meta?: winston.LogEntry): void {
        this.logger.profile(id, meta);
    }
}
