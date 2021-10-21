import { UserModule } from '@api/users';
import { USER_REPOSITORY_MODEL } from '@api/users/repositories';
import { HttpRequestMethod, HttpResponseFactory } from '@common/controllers';
import { BaseController, IControllerDefinition, IRouteDefinition } from '@common/decorators';
import { IDatabaseDriver } from '@common/drivers';
import { CORE_TYPES } from '@core/core.ioc';
import { MemoryDatabase } from '@core/database';
import express, { Application, Router } from 'express';
import { interfaces } from 'inversify';
import { AbstractApplication, IApplicationSetup } from './lib';

export class ExpressApplication extends AbstractApplication {
    public app: Application = express();

    setup(container: interfaces.Container): IApplicationSetup | Promise<IApplicationSetup> {
        container.bind<IDatabaseDriver>(CORE_TYPES.DatabaseDriver).to(MemoryDatabase).inSingletonScope();

        const database = container.get<IDatabaseDriver>(CORE_TYPES.DatabaseDriver);
        database.createModel(USER_REPOSITORY_MODEL, {});

        return { modules: [UserModule] };
    }

    registerController(controller: IControllerDefinition, routes: IRouteDefinition[]): void | Promise<void> {
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

                    res.status(200).json(HttpResponseFactory.createSuccessfulResponse(data));
                } catch (error) {
                    return next(error);
                }
            });
        });

        this.app.use(controller.path, router);
    }
}
