import winston from 'winston';

export interface ILoggerLogMethod {
    (...args: [message: string, ...meta: unknown[]] | [message: string] | [infoObject: object]): void;
}

export interface ILoggerProfile {
    (id: string | number, meta?: winston.LogEntry): void;
}

export type ILoggerLevels = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface ILogger {
    /**
     * Error log level 0
     */
    error: ILoggerLogMethod;

    /**
     * Warning log level 1
     */
    warn: ILoggerLogMethod;

    /**
     * Info log level 2
     */
    info: ILoggerLogMethod;

    /**
     * Http log level 3
     */
    http: ILoggerLogMethod;

    /**
     * Verbose log level 4
     */
    verbose: ILoggerLogMethod;

    /**
     * Debug log level 5
     */
    debug: ILoggerLogMethod;

    /**
     * Silly log level 6
     */
    silly: ILoggerLogMethod;

    profile: ILoggerProfile;
}
