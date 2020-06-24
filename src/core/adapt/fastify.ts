/*
 * @Author: Innei
 * @Date: 2020-06-24 20:01:32
 * @LastEditTime: 2020-06-24 20:09:23
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/adapt/fastify.ts
 * @Coding with Love
 */
import * as FastifyMultipart from 'fastify-multipart'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { isDev } from '../../utils'
import * as helmet from 'fastify-helmet'
import fastifyHelmet = require('fastify-helmet')
const SECRET = process.env.SECRET || ''
export const fastifyApp = new FastifyAdapter({
  logger: isDev,
  trustProxy: true,
})
fastifyApp.register(FastifyMultipart, {
  addToBody: true,
  limits: {
    fields: 10, // Max number of non-file fields
    fileSize: 1024 * 1024 * 6, // limit size 6M
    files: 5, // Max number of file fields
  },
})
fastifyApp.register(require('fastify-cookie'), {
  secret: 'asdasdasdasdsadsaxsaxassdasdqwdasdxczardja'.concat(SECRET), // for cookies signature
  parseOptions: {}, // options for parsing cookies
})
fastifyApp.register(require('fastify-session'), {
  cookieName: 'mx-space',
  secret: 'asdasdasdasdsadsaxsaxassdasdqwdasdxczardja'.concat(SECRET),
  cookie: { secure: false },
  expires: 84000,
})
fastifyApp.register(helmet, {
  hidePoweredBy: { setTo: 'PHP niu.bi.0' },
} as fastifyHelmet.FastifyHelmetOptions)
