import { HttpRequest } from '@common/controllers';
import { decorate, injectable } from 'inversify';

export const META_CONTROLLER = Symbol.for('MetaController');

export class BaseController {
    [x: string]: (httpRequest: HttpRequest) => Promise<object> | object;
}

export interface IControllerTarget {
    new (...args: never[]): unknown;
}

export interface IControllerDefinition {
    path: string;
    target: IControllerTarget;
}

export const Controller = (path = ''): ClassDecorator => {
    return (target): void => {
        const controllerMetadata: IControllerDefinition = {
            path,
            target: target as unknown as IControllerTarget
        };

        decorate(injectable(), target);

        Reflect.defineMetadata(META_CONTROLLER, controllerMetadata, target);
    };
};
