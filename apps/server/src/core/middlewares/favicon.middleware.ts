/*
 * @Author: Innei
 * @Date: 2020-05-22 11:17:11
 * @LastEditTime: 2020-08-01 14:24:56
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/middlewares/favicon.middleware.ts
 * @MIT
 */
import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { ServerResponse } from 'http'

@Injectable()
export class SkipBrowserDefaultRequestMiddleware implements NestMiddleware {
  async use(req: FastifyRequest, res: ServerResponse, next: () => void) {
    if (req.url.match(/favicon.ico$/) || req.url.match(/manifest.json$/)) {
      res.writeHead(204)
      return res.end()
    }
    next()
  }
}
