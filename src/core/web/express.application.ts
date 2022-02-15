import express, { Application, NextFunction, Request, Response } from 'express';

import { HttpResponseFactory } from '@common/controllers';
import { HttpStatus } from '@common/decorators';
import { Exception, NotFoundException } from '@common/exceptions';
import { CORE_INTERFACES, CORE_TYPES } from '@core';

import { AbstractApplication, ExpressModuleRegistry, ModuleRegistry } from './lib';

export class ExpressApplication extends AbstractApplication {
    public app: Application = express();

    protected moduleRegistry: ModuleRegistry = new ExpressModuleRegistry(this.app);

    registerMiddleware(): void | Promise<void> {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    registerErrorMiddleware(): void {
        const logger = this.container.get<CORE_INTERFACES.Logger>(CORE_TYPES.Logger);

        this.app.use('*', (req, res) => {
            const err = new NotFoundException(`Cannot ${req.method} ${req.baseUrl}`);
            const errResponse = HttpResponseFactory.createErrorResponse([{ name: err.name, message: err.message }]);

            logger.warn('Route was not found', err);

            res.status(HttpStatus.NOT_FOUND).json(errResponse);
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
            const errResponse = HttpResponseFactory.createErrorResponse([{ name: err.name, message: err.message }]);

            if (err instanceof Exception) {
                logger.warn('An exception occurred', err);
                return res.status(HttpStatus.BAD_REQUEST).json(errResponse);
            }

            logger.error('An unhandled error occurred', err);

            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errResponse);
        });
    }
}
