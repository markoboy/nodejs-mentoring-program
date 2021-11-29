import { decorate, injectable, interfaces } from 'inversify';
import { IControllerTarget } from '.';

const META_MODULE = Symbol.for('MetaModule');

export type IProviderTarget<T> = interfaces.Newable<T>;

export interface IProviderDefinition<T = unknown> {
    type: string | symbol | IProviderTarget<T>;
    target?: IProviderTarget<T>;
    value?: unknown;
}

export type IProviderTargetTypes<T = unknown> = IProviderDefinition<T> | IProviderTarget<T>;

export type IImportTarget<T = unknown> = interfaces.Newable<T>;

export type IExportTarget<T = unknown> = IProviderTargetTypes<T>;

export interface IModuleOptions {
    controllers?: IControllerTarget[];
    exports?: IExportTarget[];
    imports?: IImportTarget[];
    prefix?: string;
    providers?: IProviderTargetTypes[];
}

export interface IModuleDefinition {
    controllers?: IControllerTarget[];
    exports?: IExportTarget[];
    imports?: IImportTarget[];
    prefix?: string;
    providers?: IProviderTargetTypes[];
}

export function getModuleMetadata(constructor: IImportTarget): IModuleDefinition {
    const moduleMeta: IModuleDefinition = Reflect.getOwnMetadata(META_MODULE, constructor);

    return moduleMeta ?? {};
}

export const Module = ({ controllers, exports, imports, prefix, providers }: IModuleOptions): ClassDecorator => {
    return (target): void => {
        const moduleMetadata: IModuleDefinition = {
            controllers,
            exports,
            imports,
            prefix,
            providers
        };

        decorate(injectable(), target);

        Reflect.defineMetadata(META_MODULE, moduleMetadata, target);
    };
};
