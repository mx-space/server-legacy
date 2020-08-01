/*
 * @Author: Innei
 * @Date: 2020-08-01 14:05:25
 * @LastEditTime: 2020-08-01 14:37:12
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/middlewares/security.middleware.ts
 * @Coding with Love
 */

import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyRequest } from 'fastify/types/request'
import { ServerResponse } from 'http'
// 用于屏蔽 PHP 的请求

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  async use(req: FastifyRequest, res: ServerResponse, next: () => void) {
    if (req.url.match(/\.php$/g)) {
      res.statusMessage =
        'Eh. PHP is not support on this machine. Yep, I also think PHP is bestest programming language. But for me it is beyond my reach.'
      return res.writeHead(666).end()
    } else if (req.url.match(/\/(adminer|admin|wp-login)$/g)) {
      res.statusMessage = 'Hey, What the fuck are you doing!'
      return res.writeHead(200).end()
    } else next()
  }
}
