import { Application, Router } from 'express';
import { interfaces } from 'inversify';

import { HttpRequest, HttpRequestMethod, HttpResponseFactory } from '@common/controllers';
import { BaseController, IControllerDefinition, IRouteDefinition } from '@common/decorators';
import { CORE_INTERFACES, CORE_TYPES } from '@core';

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
        const logger = container.get<CORE_INTERFACES.Logger>(CORE_TYPES.Logger);
        logger.debug('Registering controller', { name: controller.target.name, path: controller.path, routes });

        const router = Router();

        routes.forEach((route) => {
            const controllerInstance = container.get<BaseController>(
                controller.target as unknown as typeof BaseController
            );

            const fullPath = `${controller.path}${route.path}`;
            router[route.method](route.path, async (req, res, next) => {
                const request: HttpRequest = {
                    body: req.body,
                    headers: req.headers,
                    ip: req.ip,
                    method: req.method as HttpRequestMethod,
                    params: req.params,
                    path: req.path,
                    query: req.query,
                    url: req.baseUrl
                };

                try {
                    logger.profile(fullPath);

                    logger.http(fullPath, { request, name: controller.target.name, method: route.methodName });

                    const data = await Promise.resolve(controllerInstance[route.methodName](request));

                    logger.profile(fullPath);

                    res.status(route.status).json(HttpResponseFactory.createSuccessfulResponse(data));
                } catch (error) {
                    logger.profile(fullPath);

                    logger.warn(fullPath, {
                        message: (error as Error)?.message ?? error,
                        stack: (error as Error)?.stack,
                        request,
                        name: controller.target.name,
                        method: route.methodName
                    });

                    return next(error);
                }
            });
        });

        this.app.use(controller.path, router);
    }
}
