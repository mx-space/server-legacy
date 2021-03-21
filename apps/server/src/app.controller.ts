/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2021-03-21 20:09:55
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/app.controller.ts
 * @Copyright
 */

import {
  CacheTTL,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { ApiTags } from '@nestjs/swagger'
import { ReturnModelType } from '@typegoose/typegoose'
import { FastifyReply } from 'fastify'
import { Session } from 'fastify-secure-session'
import { InjectModel } from 'nestjs-typegoose'
import { Option } from '@libs/db/models/option.model'
import { getIp } from '../../../shared/utils/ip'
import { CACHE_KEY_PREFIX } from 'shared/constants'

@Controller()
@ApiTags('Root Routes')
export class AppController {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('ping')
  async sayHello() {
    return 'pong'
  }

  @Post('like_this')
  async likeThis(
    @Req()
    req: FastifyReply & { session: Session },
    @Res() res: FastifyReply,
  ) {
    const ip = getIp(req as any)
    if (!req.session.get('like_this')) {
      req.session.set('like_this', [ip])
    } else {
      const liked = req.session.get('like_this') as string[]
      if (liked.includes(ip)) {
        return res
          .status(422)
          .header('Access-Control-Allow-Origin', req.headers['origin'])
          .header('Access-Control-Allow-Credentials', true)
          .send({ message: '一天一次就够啦' })
      }
      req.session.set('like_this', liked.concat(ip))
    }
    await this.optionModel.updateOne(
      {
        name: 'like',
      },
      {
        $inc: {
          // @ts-ignore
          value: 1,
        },
      },
      { upsert: true },
    )

    res
      .header('Access-Control-Allow-Origin', req.headers['origin'])
      .header('Access-Control-Allow-Credentials', true)
      .send('OK')
  }

  @Get('like_this')
  async getLikeNumber() {
    const doc = await this.optionModel.findOne({ name: 'like' }).lean()
    return doc ? doc.value : 0
  }

  @Get('clean_catch')
  @HttpCode(204)
  @CacheTTL(0.001)
  async cleanCatch() {
    const keys: string[] = await this.cacheManager.store.keys(
      CACHE_KEY_PREFIX + '*',
    )

    for await (const key of keys) {
      await this.cacheManager.store.del(key)
    }
    return
  }
}
