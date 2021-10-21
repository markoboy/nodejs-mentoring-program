export interface HttpResponse<T> {
    data: T | null;
    errors: Error[] | null;
    hasErrors: boolean;
    success: boolean;
}

export interface HttpErrorResponse<T> extends HttpResponse<T> {
    data: null;
    errors: Error[];
    hasErrors: true;
    success: false;
}

export interface HttpSuccessResponse<T> extends HttpResponse<T> {
    data: T;
    errors: null;
    hasErrors: false;
    success: true;
}

export class HttpResponseFactory {
    public static createSuccessfulResponse<T>(data: T): HttpSuccessResponse<T> {
        return {
            data,
            errors: null,
            hasErrors: false,
            success: true
        };
    }

    public static createErrorResponse<T>(errors: Error[]): HttpErrorResponse<T> {
        return {
            data: null,
            errors,
            hasErrors: true,
            success: false
        };
    }
}
