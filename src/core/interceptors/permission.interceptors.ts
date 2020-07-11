/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-07-11 10:55:34
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
import {
  DefaultHeaders,
  DefaultParams,
  DefaultQuery,
  FastifyRequest,
} from 'fastify'
import { IncomingMessage } from 'http'
import { isObjectLike } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AnyType } from 'src/shared/base/interfaces'

@Injectable()
export class PermissionInterceptor<T> implements NestInterceptor<T, AnyType> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<AnyType> {
    const http = context.switchToHttp()
    const req = http.getRequest<
      FastifyRequest<IncomingMessage>
    >() as FastifyRequest<
      IncomingMessage,
      DefaultQuery,
      DefaultParams,
      DefaultHeaders,
      any
    > & { isMaster: boolean }

    return next.handle().pipe(
      map((data) => {
        // data.data is array, because pager structure is { page: {}, data: [{},...] }
        if (data && isObjectLike(data) && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.filter((i) => i.hide !== true || req.isMaster),
          }
        } else if (Array.isArray(data)) {
          return data.filter((i) => i.hide !== true || req.isMaster)
        }

        if (data && data.hide === true && !req.isMaster) {
          throw new UnauthorizedException('你.是我的主人吗 ಠ_ಠ')
        }
        return data
      }),
    )
  }
}
