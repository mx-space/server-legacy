import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'

/*
 * @Author: Innei
 * @Date: 2020-05-22 11:17:11
 * @LastEditTime: 2020-05-26 09:23:31
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/middlewares/favicon.middleware.ts
 * @MIT
 */
@Injectable()
export class SkipFaviconMiddleware implements NestMiddleware {
  async use(
    req: FastifyRequest<IncomingMessage> & { url: string },
    res: ServerResponse,
    next: () => void,
  ) {
    if (req.url.match(/favicon.ico$/)) {
      res.writeHead(204)
      return res.end()
    }
    next()
  }
}
