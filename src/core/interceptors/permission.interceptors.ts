import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { IncomingMessage } from 'http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AnyType } from 'src/shared/base/interfaces'
/**
 * Only check object field has `hide` but array
 */
@Injectable()
export class PermissionInterceptor<T> implements NestInterceptor<T, AnyType> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<AnyType> {
    const http = context.switchToHttp()
    const req = http.getRequest<FastifyRequest<IncomingMessage>>()
    return next.handle().pipe(
      map((data) => {
        if (data && data.hide === true && !(req as any).isMaster) {
          throw new UnauthorizedException('你.是我的主人吗 ಠ_ಠ')
        }
        return data
      }),
    )
  }
}
