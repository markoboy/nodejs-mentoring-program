import { IControllerTarget, IImportTarget } from '@common/decorators';
import { HttpRequest } from './http-request';

export type IMiddlewareApply = IImportTarget<IHttpMiddleware<unknown>>[];
export type IMiddlewareForRoutes = (string | IControllerTarget)[];
export type IMiddlewareExclude = string[];

export interface IMiddlewareConsumer {
    /**
     * Applies a middleware on the module's router.
     *
     * @param middlewares The middleware to be applied on the module
     */
    apply(...middlewares: IMiddlewareApply): this;

    /**
     * Define which routes to use the middleware at. It can be a string using the path-to-regex package
     * or a controller.
     *
     * @param routes The routes to apply the middleware
     */
    forRoutes(...routes: IMiddlewareForRoutes): this;

    /**
     * Define which routes to exclude the middleware from running. The routes are tested with path-to-regex package
     *
     * @param routes The routes to be excluded from the middleware
     */
    exclude(...routes: IMiddlewareExclude): this;
}

export interface IMiddlewareModule {
    configure(consumer: IMiddlewareConsumer): Promise<void> | void;
}

export interface IHttpMiddleware<T> {
    /**
     * The middleware can be used to verify a request or enhance the `meta` property
     * of the request object. Throwing an error will stop the execution of the rest
     * middlewares or routes.
     *
     * @param request The incoming request when the middleware runs
     */
    use(request: HttpRequest): Promise<T> | T;
}
