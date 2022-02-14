import { IMiddlewareModule } from '@common/controllers';

export function isMiddlewareModule(coreModule: unknown): coreModule is IMiddlewareModule {
    return typeof (coreModule as IMiddlewareModule).configure === 'function';
}
