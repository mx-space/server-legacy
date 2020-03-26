import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common'
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
    const req = http.getRequest()
    return next.handle().pipe(
      map(data => {
        if (data.hide === true && !req.isMaster) {
          throw new BadRequestException('你.是我的主人吗 ಠ_ಠ')
        }
        return data
      }),
    )
  }
}
