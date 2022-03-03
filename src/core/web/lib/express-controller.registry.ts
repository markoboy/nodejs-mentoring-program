import { HttpResponseFactory } from '@common/controllers';
import { BaseController, IControllerDefinition, IRouteDefinition } from '@common/decorators';
import { CORE_INTERFACES, CORE_TYPES } from '@core';
import { Router } from 'express';
import { interfaces } from 'inversify';
import { ControllerRegistry } from './controller.registry';
import { ExpressRequestFactory } from './express-request.factory';

export class ExpressControllerRegistry extends ControllerRegistry {
    constructor(private router: Router, container: interfaces.Container) {
        super(container);
    }

    protected registerController(controller: IControllerDefinition, routes: IRouteDefinition[]): void | Promise<void> {
        const logger = this.container.get<CORE_INTERFACES.Logger>(CORE_TYPES.Logger);
        logger.debug('Registering controller', { name: controller.target.name, path: controller.path, routes });

        const router = Router();

        routes.forEach((route) => {
            const controllerInstance = this.container.get<BaseController>(
                controller.target as unknown as typeof BaseController
            );

            const fullPath = `${controller.path}${route.path}`;
            router[route.method](route.path, async (req, res, next) => {
                const request = ExpressRequestFactory.createRequest(req);

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

        this.router.use(controller.path, router);
    }
}
