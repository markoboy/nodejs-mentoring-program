import { Application, Router } from 'express';
import { interfaces } from 'inversify';

import { IMiddlewareModule } from '@common/controllers';
import { getModuleMetadata, IImportTarget } from '@common/decorators';
import { isMiddlewareModule } from '@common/utils';

import { ExpressControllerRegistry } from './express-controller.registry';
import { ExpressMiddlewareConsumer } from './express-middleware.consumer';
import { ModuleRegistry } from './module.registry';

interface IExpressModuleRegistryOptions {
    app: Application;
    container: interfaces.Container;
    router?: Router;
}

export class ExpressModuleRegistry extends ModuleRegistry {
    private readonly app: Application;

    private readonly router: Router;

    constructor({ app, container, router }: IExpressModuleRegistryOptions) {
        super(container);
        this.app = app;
        this.router = router ?? Router();
    }

    protected createModule(container: interfaces.Container): ModuleRegistry {
        const { app, router } = this;
        return new ExpressModuleRegistry({ app, container, router });
    }

    protected registerMiddleware(moduleInstance: IMiddlewareModule, moduleRouter: Router): void {
        const expressMiddlewareConsumer = new ExpressMiddlewareConsumer(this.container);
        moduleInstance.configure(expressMiddlewareConsumer);
        expressMiddlewareConsumer.use(moduleRouter);
    }

    public registerModule(CoreModule: IImportTarget<unknown>): void {
        const { controllers, prefix = '' } = getModuleMetadata(CoreModule);

        const moduleInstance = this.container.resolve(CoreModule);
        const hasMiddleware = isMiddlewareModule(moduleInstance);
        if (hasMiddleware) {
            this.registerMiddleware(moduleInstance, this.router);
        }

        super.registerModule(CoreModule);

        if (controllers?.length) {
            const controllerRegistry = new ExpressControllerRegistry(this.router, this.container);
            controllerRegistry.registerControllers(controllers);
        }

        if (hasMiddleware || controllers?.length) {
            this.app.use(this.getModulePrefix(prefix), this.router);
        }
    }
}
