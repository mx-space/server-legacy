/*
 * @Author: Innei
 * @Date: 2020-05-10 15:22:08
 * @LastEditTime: 2020-05-26 09:23:20
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/middlewares/analyze.middleware.ts
 * @MIT
 */

import { Injectable, NestMiddleware } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { FastifyRequest } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'
import { RedisService } from 'nestjs-redis'
import { InjectModel } from 'nestjs-typegoose'
import { UAParser } from 'ua-parser-js'
import { Analyze } from '../../../libs/db/src/models/analyze.model'
import { Option } from '../../../libs/db/src/models/option.model'
import { getIp } from '../../utils/ip'
import { RedisNames } from '../../../libs/common/src/redis/redis.types'
@Injectable()
export class AnalyzeMiddleware implements NestMiddleware {
  private parser: UAParser
  constructor(
    @InjectModel(Analyze)
    private readonly model: ReturnModelType<typeof Analyze>,
    @InjectModel(Option)
    private readonly options: ReturnModelType<typeof Option>,
    private readonly redisCtx: RedisService,
  ) {
    this.parser = new UAParser()
  }
  async use(
    req: FastifyRequest<IncomingMessage>,
    res: ServerResponse,
    next: () => void,
  ) {
    if (req.headers['Authorization'] || req.headers['authorization']) {
      return next()
    }

    try {
      const ip = getIp(req)
      this.parser.setUA(req.headers['user-agent'])

      const ua = this.parser.getResult()
      await this.model.create({
        ip,
        ua,
        path: (req as any).url,
      })
      const apiCallTimeRecord = await this.options.findOne({
        name: 'apiCallTime',
      })
      if (!apiCallTimeRecord) {
        await this.options.create({
          name: 'apiCallTime',
          value: 1,
        })
      } else {
        await this.options.updateOne(
          { name: 'apiCallTime' },
          {
            $inc: {
              value: 1 as never, // why never ???
            },
          },
        )
      }
      // ip access in redis
      const client = this.redisCtx.getClient(RedisNames.Access)
      const fromRedisIps = await client.get('ips')
      const ips = fromRedisIps ? JSON.parse(fromRedisIps) : []
      if (!ips.includes(ip)) {
        await client.set('ips', JSON.stringify([...ips, ip]))
        // record uv to db
        new Promise(async () => {
          const uvRecord = await this.options.findOne({ name: 'uv' })
          if (uvRecord) {
            await uvRecord.updateOne({
              $inc: {
                value: 1,
              },
            })
          } else {
            await this.options.create({
              name: 'uv',
              value: 1,
            })
          }
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      next()
    }
  }
}
