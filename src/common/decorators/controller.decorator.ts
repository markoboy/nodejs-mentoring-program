import { decorate, injectable, interfaces } from 'inversify';
import { HttpRequest } from '@common/controllers';

const META_CONTROLLER = Symbol.for('MetaController');

export class BaseController {
    [x: string]: (httpRequest: HttpRequest) => Promise<object> | object;
}

export type IControllerTarget<T = unknown> = interfaces.Newable<T>;

export interface IControllerDefinition {
    path: string;
    target: IControllerTarget;
}

export function getControllerMetadata(constructor: IControllerTarget): IControllerDefinition {
    const controllerMetadata: IControllerDefinition = Reflect.getOwnMetadata(META_CONTROLLER, constructor);

    return controllerMetadata ?? {};
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
