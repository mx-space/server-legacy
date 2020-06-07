import { FastifyRequest } from 'fastify'

export const getIp = (request: FastifyRequest) => {
  let ip =
    request.headers['x-forwarded-for'] ||
    request.ip ||
    request.req.connection.remoteAddress ||
    request.req.socket.remoteAddress ||
    undefined
  if (ip && ip.split(',').length > 0) {
    ip = ip.split(',')[0]
  }
  return ip
}
