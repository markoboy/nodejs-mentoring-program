import { Request } from 'express';
import { HttpRequest, HttpRequestMethod } from '@common/controllers';

export class ExpressRequestFactory {
    static createRequest(req: Request): HttpRequest {
        return {
            body: req.body,
            headers: req.headers,
            ip: req.ip,
            method: req.method as HttpRequestMethod,
            params: req.params,
            path: req.path,
            query: req.query,
            url: req.originalUrl,
            context: req.context
        };
    }
}
