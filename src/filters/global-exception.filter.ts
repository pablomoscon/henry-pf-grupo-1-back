import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unhandled Exception';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();
      if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else {
        message = JSON.stringify(responseMessage);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled exception:', exception);
    }
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
