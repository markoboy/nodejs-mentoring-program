import { HttpRequestDefaultContext } from '@common/controllers';

declare module 'express-serve-static-core' {
    export interface Request {
        context?: HttpRequestDefaultContext;
    }
}
