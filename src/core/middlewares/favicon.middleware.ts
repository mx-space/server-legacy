import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'

/*
 * @Author: Innei
 * @Date: 2020-05-22 11:17:11
 * @LastEditTime: 2020-05-22 11:26:38
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/middlewares/favicon.middleware.ts
 * @MIT
 */
@Injectable()
export class SkipFaviconMiddleware implements NestMiddleware {
  async use(
    req: FastifyRequest<IncomingMessage> & { url: string },
    res: ServerResponse,
    next: Function,
  ) {
    if (req.url.match(/favicon.ico$/)) {
      res.writeHead(204)
      return res.end()
    }
    next()
  }
}
