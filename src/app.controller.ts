/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-07-08 21:34:24
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/app.controller.ts
 * @Copyright
 */

import { Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ReturnModelType } from '@typegoose/typegoose'
import { FastifyReply } from 'fastify'
import { Http2SecureServer } from 'http2'
import { InjectModel } from 'nestjs-typegoose'
import { Option } from '../libs/db/src/models/option.model'
import { getIp } from './utils/ip'

@Controller()
@ApiTags('Root Routes')
export class AppController {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
  ) {}
  @Post('like_this')
  async likeThis(
    @Req() req: FastifyReply<Http2SecureServer> & { session: any },
    @Res() res: FastifyReply,
  ) {
    const ip = getIp(req as any)
    if (!req.session.like_this) {
      req.session.like_this = [ip]
    } else {
      if ((req.session.like_this as string[]).includes(ip)) {
        return res
          .status(422)
          .header('Access-Control-Allow-Origin', req.headers['origin'])
          .header('Access-Control-Allow-Credentials', true)
          .send({ message: '一天一次就够啦' })
      }
      req.session.like_this.push(ip)
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
}
