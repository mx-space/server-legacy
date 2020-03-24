import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const reorganize = data => {
      if (!data) {
        return { data: null }
      }
      return typeof data !== 'object' || data.__proto__.constructor === Object
        ? { ...data }
        : { data }
    }
    return next
      .handle()
      .pipe(
        map(data => ({ ok: 1, timestamp: new Date(), ...reorganize(data) })),
      )
  }
}
