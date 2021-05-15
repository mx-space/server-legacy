/*
 * @Author: Innei
 * @Date: 2020-11-24 16:20:37
 * @LastEditTime: 2021-03-21 20:12:56
 * @LastEditors: Innei
 * @FilePath: /server/shared/core/interceptors/response.interceptors.ts
 * Mark: Coding with Love
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common'
import { isArrayLike, isObjectLike } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { isDev } from 'utils/index'

const snakecaseKeys = require('snakecase-keys')
export interface Response<T> {
  data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const reorganize = (data) => {
      if (!data) {
        throw new UnprocessableEntityException('数据丢失了(｡ ́︿ ̀｡)')
      }
      return typeof data !== 'object' || data.__proto__.constructor === Object
        ? { ...data }
        : { data }
    }
    return next.handle().pipe(
      map((data) =>
        typeof data === 'undefined'
          ? // HINT: hack way to solve `undefined` as cache value set into redis got an error.
            ''
          : typeof data === 'object' && data !== null
          ? { ok: 1, ...reorganize(data) }
          : data,
      ),
    )
  }
}

export class JSONSerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(function process(data) {
        if (!isObjectLike(data)) {
          return data
        }
        let handled = data
        if (data.toJSON) {
          handled = data.toJSON()
        }

        if (handled.data) {
          if (handled.data.toJSON) {
            handled.data = handled.data.toJSON()
          } else if (isArrayLike(handled.data)) {
            handled.data = handled.data.map((item) =>
              item.toJSON ? item.toJSON() : item,
            )
          }
        }

        delete data._v

        return snakecaseKeys(handled, { deep: true })
      }),
    )
  }
}
