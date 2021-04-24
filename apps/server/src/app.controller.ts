/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2021-03-21 20:09:55
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/app.controller.ts
 * @Copyright
 */

import { RedisNames } from '@libs/common/redis/redis.types'
import { Option } from '@libs/db/models/option.model'
import {
  CacheTTL,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ReturnModelType } from '@typegoose/typegoose'
import { Cache } from 'cache-manager'
import { FastifyReply } from 'fastify'
import { RedisService } from 'nestjs-redis'
import { InjectModel } from 'nestjs-typegoose'
import { CACHE_KEY_PREFIX } from 'shared/constants'
import { getIp } from '../../../shared/utils/ip'

@Controller()
@ApiTags('Root Routes')
export class AppController {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
    private readonly redisService: RedisService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('ping')
  async sayHello() {
    return 'pong'
  }

  @Post('like_this')
  async likeThis(
    @Req()
    req: FastifyReply,
  ) {
    const ip = getIp(req as any)
    const redis = this.redisService.getClient(RedisNames.Like)
    const isLikedBefore = await redis.sismember('site', ip)
    if (isLikedBefore) {
      throw new UnprocessableEntityException('一天一次就够啦')
    } else {
      redis.sadd('site', ip)
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

    return 'OK'
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
