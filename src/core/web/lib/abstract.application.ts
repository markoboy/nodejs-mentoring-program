import { Container, interfaces } from 'inversify';

import { IImportTarget } from '@common/decorators';
import { CORE_INTERFACES, CORE_TYPES } from '@core';

import { ModuleRegistry } from './module.registry';

export interface IApplicationOptions {
    containerOptions?: interfaces.ContainerOptions;
    logger: CORE_INTERFACES.Logger;
}

export abstract class AbstractApplication {
    protected readonly container: interfaces.Container;

    protected readonly logger: CORE_INTERFACES.Logger;

    protected abstract readonly moduleRegistry: ModuleRegistry;

    constructor(protected readonly bootstrapModule: IImportTarget, { containerOptions, logger }: IApplicationOptions) {
        this.container = new Container(containerOptions);
        this.logger = logger;

        this.container.bind<CORE_INTERFACES.Logger>(CORE_TYPES.Logger).toConstantValue(this.logger);
    }

    public getContainer(): interfaces.Container {
        return this.container;
    }

    public async setup(): Promise<void> {
        this.logger.info('Setting up application');

        await Promise.resolve(this.registerMiddleware());
        this.logger.info('Registered application middleware');

        await Promise.resolve(this.moduleRegistry.registerModule(this.bootstrapModule));
        this.logger.info('Registered application modules');

        await Promise.resolve(this.registerErrorMiddleware());
        this.logger.info('Registered application error middleware');
    }

    abstract registerMiddleware(): Promise<void> | void;

    abstract registerErrorMiddleware(): Promise<void> | void;
}
