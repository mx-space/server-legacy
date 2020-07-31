/*
 * @Author: Innei
 * @Date: 2020-06-24 20:01:32
 * @LastEditTime: 2020-07-31 19:22:40
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/adapt/fastify.ts
 * @Coding with Love
 */
import * as FastifyMultipart from 'fastify-multipart'
import type _FastifyMultipart from 'fastify-multipart'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { isDev } from '../../utils'
import * as helmet from 'fastify-helmet'
import type Helmet from 'fastify-helmet'
import * as Session from 'fastify-secure-session'
import type _Session from 'fastify-secure-session'
const SECRET = process.env.SECRET || ''
export const fastifyApp = new FastifyAdapter({
  logger: isDev,
  trustProxy: true,
})
fastifyApp.register((FastifyMultipart as any) as typeof _FastifyMultipart, {
  addToBody: true,
  limits: {
    fields: 10, // Max number of non-file fields
    fileSize: 1024 * 1024 * 6, // limit size 6M
    files: 5, // Max number of file fields
  },
})

fastifyApp.register((Session as any) as typeof _Session, {
  secret: 'asdasdasdasdsadsaxsaxassdasdqwdasdxczardja'.concat(SECRET),
  salt: SECRET.repeat(16).slice(0, 16) || 'mq9hDxBVDbspDR6n',
  cookie: { secure: false, maxAge: 84000 },
})
fastifyApp.register((helmet as any) as typeof Helmet, {
  hidePoweredBy: { setTo: 'PHP 666.666' },
})
