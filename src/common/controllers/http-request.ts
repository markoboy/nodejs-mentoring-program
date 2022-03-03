import { IncomingHttpHeaders } from 'http';

export type HttpRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type HttpRequestDefaultParams = Record<string, unknown>;
export type HttpRequestDefaultBody = Record<string, unknown>;
export type HttpRequestDefaultContext = Record<string, unknown>;
export type HttpRequestDefaultQuery = Record<string, unknown>;

export interface HttpRequest<
    C = HttpRequestDefaultContext,
    B = HttpRequestDefaultBody,
    P = HttpRequestDefaultParams,
    Q = HttpRequestDefaultQuery
> {
    body: B;
    headers: IncomingHttpHeaders;
    ip: string;
    method: HttpRequestMethod;
    path: string;
    params: P;
    query: Q;
    url: string;
    context?: C;
}
