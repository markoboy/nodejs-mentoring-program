import { HttpRequestMethod } from '@common/controllers';

const META_ROUTE = Symbol.for('MetaRoute');

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

export type IRouteDecorator = (path: string, status?: HttpStatus) => MethodDecorator;

export interface IRouteDefinition {
    method: HttpRequestMethod;
    methodName: string;
    path: string;
    status: HttpStatus;
}

export function getRoutesMetadata(constructor: object): IRouteDefinition[] {
    const routesMetadata: IRouteDefinition[] = Reflect.getOwnMetadata(META_ROUTE, constructor);

    return routesMetadata ?? {};
}

const routeDecoratorFactory = (method: HttpRequestMethod): IRouteDecorator => {
    return (path, status = HttpStatus.OK): MethodDecorator => {
        return (target, propertyKey): void => {
            const routeMetadata: IRouteDefinition = {
                method,
                path,
                methodName: propertyKey.toString(),
                status
            };

            const routes: IRouteDefinition[] = Reflect.getOwnMetadata(META_ROUTE, target.constructor) ?? [];

            routes.push(routeMetadata);

            Reflect.defineMetadata(META_ROUTE, routes, target.constructor);
        };
    };
};

export const Get = routeDecoratorFactory('get');

export const Post = routeDecoratorFactory('post');

export const Put = routeDecoratorFactory('put');

export const Patch = routeDecoratorFactory('patch');

export const Delete = routeDecoratorFactory('delete');
