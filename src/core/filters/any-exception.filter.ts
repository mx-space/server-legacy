import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
type myError = {
  readonly status: number
  readonly statusCode?: number
  readonly msg: string
  readonly message?: string
}
import { FastifyReply, FastifyRequest } from 'fastify'
import { ServerResponse, IncomingMessage } from 'http'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // super.catch(exception, host)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply<ServerResponse>>()
    const request = ctx.getRequest<FastifyRequest<IncomingMessage>>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception as myError)?.status ||
          (exception as myError)?.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR

    console.error(exception)

    response.status(status).send({
      ok: 0,
      statusCode: status,
      message:
        (exception as any)?.response?.message ||
        (exception as myError)?.message ||
        (exception as myError).message,
      timestamp: new Date().toISOString(),
      path: request.req.url,
    })
  }
}
