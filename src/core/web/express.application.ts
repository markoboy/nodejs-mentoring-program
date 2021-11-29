import express, { Application, NextFunction, Request, Response } from 'express';

import { HttpResponseFactory } from '@common/controllers';
import { HttpStatus } from '@common/decorators';
import { Exception } from '@common/exceptions';

import { AbstractApplication, ExpressModuleRegistry, ModuleRegistry } from './lib';

export class ExpressApplication extends AbstractApplication {
    public app: Application = express();

    protected moduleRegistry: ModuleRegistry = new ExpressModuleRegistry(this.app);

    registerMiddleware(): void | Promise<void> {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    registerErrorMiddleware(): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
            const errResponse = HttpResponseFactory.createErrorResponse([{ name: err.name, message: err.message }]);

            if (err instanceof Exception) {
                return res.status(HttpStatus.BAD_REQUEST).json(errResponse);
            }

            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errResponse);
        });
    }
}
