import {
    IControllerDefinition,
    IControllerTarget,
    IModuleDefinition,
    IRouteDefinition,
    META_CONTROLLER,
    META_MODULE,
    META_ROUTE
} from '@common/decorators';
import { Container, interfaces } from 'inversify';

function getControllerMetadata(constructor: object): IControllerDefinition {
    const controllerMetadata: IControllerDefinition = Reflect.getOwnMetadata(META_CONTROLLER, constructor);

    return controllerMetadata;
}

function getRoutesMetadata(constructor: object): IRouteDefinition[] {
    const routesMetadata: IRouteDefinition[] = Reflect.getOwnMetadata(META_ROUTE, constructor);

    return routesMetadata;
}

class BaseModule {}

export interface IModule {
    new (...args: never): BaseModule;
}

export interface IApplicationOptions {
    containerOptions?: interfaces.ContainerOptions;
}

export interface IApplicationSetup {
    modules: IModule[];
}

export abstract class AbstractApplication {
    protected readonly container: interfaces.Container;

    constructor({ containerOptions }: IApplicationOptions = {}) {
        this.container = new Container(containerOptions);

        Promise.resolve(this.setup(this.container)).then(({ modules }) => {
            this.registerModules(modules);

            return this.registerErrorMiddleware();
        });
    }

    abstract setup(container: interfaces.Container): Promise<IApplicationSetup> | IApplicationSetup;

    abstract registerErrorMiddleware(): Promise<void> | void;

    abstract registerController(controller: IControllerDefinition, routes: IRouteDefinition[]): Promise<void> | void;

    /**
     * Registers controllers of each module to the application.
     *
     * @param controllers The controllers of each module
     */
    private registerControllers(controllers: IControllerTarget[]): void {
        controllers.forEach((controller) => {
            const controllerMetadata = getControllerMetadata(controller);
            const routesMetadata = getRoutesMetadata(controller);

            if (controllerMetadata && routesMetadata) {
                this.registerController(controllerMetadata, routesMetadata);
            }
        });
    }

    /**
     * Registers all modules to the application.
     *
     * @param modules All modules to be loaded
     */
    private registerModules(modules: IModule[]): void {
        modules.forEach((md) => {
            const resolvedModule = this.container.resolve<BaseModule>(md);

            const moduleMeta: IModuleDefinition = Reflect.getMetadata(META_MODULE, resolvedModule.constructor);

            this.container.load(moduleMeta.container);

            this.registerControllers(moduleMeta.controllers);
        });
    }
}
