import {
  Injectable,
  CacheInterceptor,
  ExecutionContext,
  CACHE_KEY_METADATA,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IncomingMessage } from 'node:http'
import { CACHE_KEY_PREFIX } from 'shared/constants'

/*
 * @Author: Innei
 * @Date: 2021-03-21 19:29:52
 * @LastEditTime: 2021-03-21 20:04:08
 * @LastEditors: Innei
 * @FilePath: /server/shared/core/interceptors/http-cache.interceptors.ts
 * Mark: Coding with Love
 */

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const http = context.switchToHttp()
    const meta = (this.reflector as Reflector).get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    )

    const req = http.getRequest() as IncomingMessage
    const path = req.url

    return CACHE_KEY_PREFIX + (meta ? `name:${meta}` : path)
  }
}
