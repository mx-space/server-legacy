/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-07-12 13:46:47
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/interceptors/permission.interceptors.ts
 * @Coding with Love
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AnyType } from 'apps/server/src/shared/base/interfaces'
import { IncomingMessage } from 'http'
import { isObjectLike } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class PermissionInterceptor<T> implements NestInterceptor<T, AnyType> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<AnyType> {
    const http = context.switchToHttp()
    const req = http.getRequest() as IncomingMessage

    return handle(next, req)
  }
}

@Injectable()
export class PermissionGQLInterceptor<T>
  implements NestInterceptor<T, AnyType> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<AnyType> {
    // const http = context.switchToHttp()
    const req = GqlExecutionContext.create(context).getContext()
      .req as IncomingMessage

    return handle(next, req)
  }
}
function handle(next: CallHandler<any>, req: IncomingMessage): Observable<any> {
  return next.handle().pipe(
    map((data) => {
      // @ts-ignore
      if (!req.isMaster) {
        // data.data is array, because pager structure is { page: {}, data: [{},...] }
        if (data && isObjectLike(data) && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.filter((i) => i.hide !== true),
          }
        } else if (Array.isArray(data)) {
          return data.filter((i) => i.hide !== true)
        }

        if (data && data.hide === true) {
          throw new UnauthorizedException('你.是我的主人吗 ಠ_ಠ')
        }
      }
      return data
    }),
  )
}
