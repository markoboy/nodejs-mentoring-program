import { UserModule } from '@api/users';
import { USER_REPOSITORY_MODEL } from '@api/users/repositories';
import { HttpRequestMethod, HttpResponseFactory } from '@common/controllers';
import { BaseController, HttpStatus, IControllerDefinition, IRouteDefinition } from '@common/decorators';
import { IDatabaseDriver } from '@common/drivers';
import { Exception } from '@common/exceptions';
import { CORE_TYPES } from '@core/core.ioc';
import { MemoryDatabase } from '@core/database';
import express, { Application, NextFunction, Request, Response, Router } from 'express';
import { interfaces } from 'inversify';
import { AbstractApplication, IApplicationOptions, IApplicationSetup } from './lib';

export class ExpressApplication extends AbstractApplication {
    public app: Application = express();

    constructor(options?: IApplicationOptions) {
        super(options);

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    setup(container: interfaces.Container): IApplicationSetup | Promise<IApplicationSetup> {
        container.bind<IDatabaseDriver>(CORE_TYPES.DatabaseDriver).to(MemoryDatabase).inSingletonScope();

        const database = container.get<IDatabaseDriver>(CORE_TYPES.DatabaseDriver);
        database.createModel(USER_REPOSITORY_MODEL, {});

        return { modules: [UserModule] };
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

    registerController(controller: IControllerDefinition, routes: IRouteDefinition[]): void | Promise<void> {
        console.log(`[Controller]:[${controller.path}] Registration for ${controller.target.name} started`);
        console.table(routes);

        const router = Router();

        routes.forEach((route) => {
            router[route.method](route.path, async (req, res, next) => {
                const controllerInstance = this.container.get<BaseController>(
                    controller.target as unknown as typeof BaseController
                );

                try {
                    console.time(`[${controller.target.name}]:[${route.methodName}] Request route handler`);

                    const data = await Promise.resolve(
                        controllerInstance[route.methodName]({
                            body: req.body,
                            headers: req.headers,
                            ip: req.ip,
                            method: req.method as HttpRequestMethod,
                            params: req.params,
                            path: req.path,
                            query: req.query,
                            url: req.url
                        })
                    );

                    console.timeEnd(`[${controller.target.name}]:[${route.methodName}] Request route handler`);

                    res.status(route.status).json(HttpResponseFactory.createSuccessfulResponse(data));
                } catch (error) {
                    console.timeEnd(`[${controller.target.name}]:[${route.methodName}] Request route handler`);

                    return next(error);
                }
            });
        });

        this.app.use(controller.path, router);

        console.log(`[Controller]:[${controller.path}] ${controller.target.name} was registered\n`);
    }
}
