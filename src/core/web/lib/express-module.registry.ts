import { Application, Router } from 'express';
import { interfaces } from 'inversify';

import { HttpRequestMethod, HttpResponseFactory } from '@common/controllers';
import { BaseController, IControllerDefinition, IRouteDefinition } from '@common/decorators';

import { ModuleRegistry } from './module.registry';

export class ExpressModuleRegistry extends ModuleRegistry {
    constructor(private readonly app: Application) {
        super();
    }

    protected registerController(
        controller: IControllerDefinition,
        routes: IRouteDefinition[],
        container: interfaces.Container
    ): void | Promise<void> {
        console.log(`[Controller]:[${controller.path}] Registration for ${controller.target.constructor.name} started`);
        console.table(routes);

        const router = Router();

        routes.forEach((route) => {
            router[route.method](route.path, async (req, res, next) => {
                const controllerInstance = container.get<BaseController>(
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
