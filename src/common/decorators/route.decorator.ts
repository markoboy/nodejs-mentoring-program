import { HttpRequestMethod } from '@common/controllers';

export const META_ROUTE = Symbol.for('MetaRoute');

export type IRouteDecorator = (path: string) => MethodDecorator;

export interface IRouteDefinition {
    method: HttpRequestMethod;
    methodName: string;
    path: string;
}

const routeDecoratorFactory = (method: HttpRequestMethod): IRouteDecorator => {
    return (path): MethodDecorator => {
        return (target, propertyKey): void => {
            const routeMetadata: IRouteDefinition = {
                method,
                methodName: propertyKey.toString(),
                path
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
