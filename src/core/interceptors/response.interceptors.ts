import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
import { ServerResponse, IncomingMessage } from 'http'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
export interface Response<T> {
  data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // const req = context
    //   .switchToHttp()
    //   .getRequest<FastifyRequest<IncomingMessage>>()
    // context
    //   .switchToHttp()
    //   .getResponse<FastifyReply<ServerResponse>>()
    //   .header('Access-Control-Allow-Origin', req.hostname + req.req.url)
    const reorganize = (data) => {
      if (!data) {
        throw new UnprocessableEntityException('数据丢失了(｡ ́︿ ̀｡)')
      }
      return typeof data !== 'object' || data.__proto__.constructor === Object
        ? { ...data }
        : { data }
    }
    return next
      .handle()
      .pipe(
        map((data) =>
          typeof data === 'object' && data !== null
            ? { ok: 1, timestamp: new Date(), ...reorganize(data) }
            : data,
        ),
      )
  }
}
