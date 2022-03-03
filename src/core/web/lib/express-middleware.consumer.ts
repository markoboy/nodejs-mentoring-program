import { Router } from 'express';
import { interfaces } from 'inversify';
import pathToRegexp from 'path-to-regexp';

import { IMiddlewareApply, IMiddlewareConsumer, IMiddlewareExclude, IMiddlewareForRoutes } from '@common/controllers';
import { getControllerMetadata } from '@common/decorators';

import { ExpressRequestFactory } from './express-request.factory';
import { CORE_INTERFACES, CORE_TYPES } from '@core';

export class ExpressMiddlewareConsumer implements IMiddlewareConsumer {
    protected middlewares: IMiddlewareApply = [];

    protected routes: string[] = [];

    protected excludeRoutes: string[] = [];

    constructor(protected container: interfaces.Container) {}

    apply(...middlewares: IMiddlewareApply): this {
        this.middlewares = middlewares;
        return this;
    }

    forRoutes(...routes: IMiddlewareForRoutes): this {
        this.routes = routes.reduce<string[]>((acc, route) => {
            let path = route;

            if (typeof route !== 'string') {
                ({ path } = getControllerMetadata(route));
            }

            acc.push(path as string);

            return acc;
        }, []);

        return this;
    }

    exclude(...routes: IMiddlewareExclude): this {
        this.excludeRoutes = routes;
        return this;
    }

    use(router: Router): void {
        const routesRegexp = pathToRegexp(this.routes);
        const excludeRegexp = pathToRegexp(this.excludeRoutes);

        const logger = this.container.get<CORE_INTERFACES.Logger>(CORE_TYPES.Logger);
        const { middlewares, routes, exclude } = this;
        logger.debug('Registering Middleware', { middlewares, routes, exclude });

        router.use(async (req, res, next) => {
            const url = req.originalUrl;
            try {
                if (!excludeRegexp.test(url) && routesRegexp.test(url)) {
                    const request = ExpressRequestFactory.createRequest(req);

                    for (const middlewareClass of this.middlewares) {
                        logger.http(`Middleware ${url}`, { name: middlewareClass.name, request });

                        const middlewareInstance = this.container.resolve(middlewareClass);

                        const result = await Promise.resolve(middlewareInstance.use(request));

                        req.context = Object.assign(req.context ?? {}, result);

                        logger.http('Context', { name: middlewareClass.name, context: req.context });
                    }
                }

                next();
            } catch (error) {
                next(error);
            }
        });
    }
}
