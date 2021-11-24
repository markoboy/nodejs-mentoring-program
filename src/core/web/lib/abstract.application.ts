import { Container, interfaces } from 'inversify';

import { IImportTarget } from '@common/decorators';

import { ModuleRegistry } from './module.registry';

export interface IApplicationOptions {
    containerOptions?: interfaces.ContainerOptions;
}

export abstract class AbstractApplication {
    protected readonly container: interfaces.Container;

    protected abstract readonly moduleRegistry: ModuleRegistry;

    constructor(protected readonly bootstrapModule: IImportTarget, { containerOptions }: IApplicationOptions = {}) {
        this.container = new Container(containerOptions);
    }

    public async setup(): Promise<void> {
        // Register middleware
        await Promise.resolve(this.registerMiddleware());

        // Register modules
        await Promise.resolve(this.moduleRegistry.registerModule(this.bootstrapModule, this.container));

        // Register error middleware
        await Promise.resolve(this.registerErrorMiddleware());
    }

    abstract registerMiddleware(): Promise<void> | void;

    abstract registerErrorMiddleware(): Promise<void> | void;
}
