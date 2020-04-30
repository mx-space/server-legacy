import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { IncomingMessage } from 'http'
import { FastifyRequest } from 'fastify'

@Injectable()
export class SpiderGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const http = context.switchToHttp()
    const request = http.getRequest<FastifyRequest<IncomingMessage>>()
    const headers = request.headers
    // const { referer } = headers
    const ua: string = headers['user-agent'] || ''
    const isSpiderUA = !!ua.match(/(Scrapy|Curl|HttpClient|python|requests)/i)
    if (ua && !isSpiderUA) {
      return true
    }
    throw new ForbiddenException('爬虫, 禁止')
  }
}
