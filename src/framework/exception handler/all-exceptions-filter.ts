import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    private readonly logger = new Logger('GlobalExceptionFilter');

    catch(exception: any, host: ArgumentsHost): void {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.

        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMessage = 'Internal server error';

        if (exception instanceof Error) {
            this.logger.error(`An error occurred: ${exception.message}`, exception.stack);

            if (exception['response']) {
                errorMessage = exception['response'].message;
            } else {
                errorMessage = exception.message;
            }
        }
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().getTime(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: errorMessage,
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
