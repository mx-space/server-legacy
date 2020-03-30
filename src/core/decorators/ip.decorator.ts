import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { IncomingMessage } from 'http'

export type IpRecord = {
  ip: string
  agent: string
}
export const IpLocation = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<FastifyRequest<IncomingMessage>>()
    // const ip = request.headers[''] || request.ip
    let ip =
      request.headers['x-forwarded-for'] ||
      request.ip ||
      request.req.connection.remoteAddress ||
      request.req.socket.remoteAddress ||
      undefined
    if (ip && ip.split(',').length > 0) {
      ip = ip.split(',')[0]
    }
    const agent = request.headers['user-agent']
    return {
      ip,
      agent,
    }
  },
)
