/*
 * @Author: Innei
 * @Date: 2020-05-10 15:22:08
 * @LastEditTime: 2020-10-08 14:02:10
 * @LastEditors: Innei
 * @FilePath: /server/src/core/middlewares/analyze.middleware.ts
 * @MIT
 */

import { HttpService, Injectable, NestMiddleware } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ReturnModelType } from '@typegoose/typegoose'
import { FastifyRequest } from 'fastify'
import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'
import { ServerResponse } from 'http'
import { RedisService } from 'nestjs-redis'
import { InjectModel } from 'nestjs-typegoose'
import { join } from 'path'
import { DATA_DIR } from 'src/constants'
import { UAParser } from 'ua-parser-js'
import { RedisNames } from '../../../libs/common/src/redis/redis.types'
import { Analyze } from '../../../libs/db/src/models/analyze.model'
import { Option } from '../../../libs/db/src/models/option.model'
import { getIp } from '../../utils/ip'
@Injectable()
export class AnalyzeMiddleware implements NestMiddleware {
  private parser: UAParser
  private botListData: RegExp[] = []
  private localBotListDataFilePath = join(DATA_DIR, 'bot_list.json')
  constructor(
    @InjectModel(Analyze)
    private readonly model: ReturnModelType<typeof Analyze>,
    @InjectModel(Option)
    private readonly options: ReturnModelType<typeof Option>,
    private readonly redisCtx: RedisService,
    private readonly http: HttpService,
  ) {
    this.parser = new UAParser()
    this.botListData = this.getLocalBotList()

    this.updateBotList()
  }
  async use(req: FastifyRequest, res: ServerResponse, next: () => void) {
    const ip = getIp(req)

    // if req from SSR server, like 127.0.0.1, skip
    if (['127.0.0.1', 'localhost', '::-1'].includes(ip)) {
      return next()
    }

    // if is login and is master, skip
    if (req.headers['Authorization'] || req.headers['authorization']) {
      return next()
    }

    // if user agent is in bot list, skip
    if (this.botListData.some((rg) => rg.test(req.headers['user-agent']))) {
      return next()
    }

    try {
      this.parser.setUA(req.headers['user-agent'])

      const ua = this.parser.getResult()
      // @ts-ignore
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
        new Promise(async (resolve) => {
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
          resolve(null)
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      next()
    }
  }

  getLocalBotList() {
    try {
      return this.pickPattern2Regexp(
        JSON.parse(
          readFileSync(this.localBotListDataFilePath, {
            encoding: 'utf-8',
          }),
        ),
      )
    } catch {
      return []
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async updateBotList() {
    const { data: json } = await this.http
      .get(
        'https://cdn.jsdelivr.net/gh/atmire/COUNTER-Robots@master/COUNTER_Robots_list.json',
      )
      .toPromise()

    writeFileSync(this.localBotListDataFilePath, JSON.stringify(json), {
      encoding: 'utf-8',
      flag: 'w+',
    })
    this.botListData = this.pickPattern2Regexp(json)

    return json
  }

  pickPattern2Regexp(data: any): RegExp[] {
    return data.map((item) => new RegExp(item.pattern))
  }
}
