import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
type myErrorDto = {
  readonly status: number
  readonly statusCode?: number
  readonly msg: string
  readonly message?: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // super.catch(exception, host)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception as myErrorDto)?.status ||
          (exception as myErrorDto)?.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR

    console.error(exception)

    response.status(status).json({
      ok: 0,
      statusCode: status,
      msg: (exception as myErrorDto)?.msg || (exception as myErrorDto).message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
