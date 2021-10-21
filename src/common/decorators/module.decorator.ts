import { AsyncContainerModule, ContainerModule, decorate, injectable } from 'inversify';
import { IControllerTarget } from '.';

export const META_MODULE = Symbol.for('MetaModule');

export interface IServiceTarget {
    new (...args: never[]): unknown;
}

export interface IServiceDefinition {
    type: string | symbol;
    target: IServiceTarget;
}

export interface IModuleOptions {
    controllers: IControllerTarget[];
    services: (IServiceTarget | IServiceDefinition)[];
}

export interface IModuleDefinition {
    container: AsyncContainerModule | ContainerModule;
    controllers: IControllerTarget[];
}

function isServiceDefinition(definition: IServiceDefinition | IServiceTarget): definition is IServiceDefinition {
    return typeof definition !== 'function';
}

function getModuleContainer({ services, controllers }: IModuleOptions): ContainerModule {
    return new ContainerModule((bind) => {
        services.forEach((service) => {
            if (isServiceDefinition(service)) {
                bind(service.type).to(service.target).inSingletonScope();
            } else {
                bind(service).toSelf().inSingletonScope();
            }
        });

        controllers.forEach((controller) => {
            bind(controller).toSelf().inRequestScope();
        });
    });
}

export const Module = ({ controllers, services }: IModuleOptions): ClassDecorator => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any): void => {
        const moduleMetadata: IModuleDefinition = {
            container: getModuleContainer({ controllers, services }),
            controllers
        };

        decorate(injectable(), target);

        Reflect.defineMetadata(META_MODULE, moduleMetadata, target);
    };
};
