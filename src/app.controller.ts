/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-25 20:46:34
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/app.controller.ts
 * @Copyright
 */

import { Post, Req, Res, Controller, Get } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Option } from '../libs/db/src/models/option.model'
import { InjectModel } from 'nestjs-typegoose'
import { getIp } from './utils/ip'
import { FastifyReply } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'
import { ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('Root Routes')
export class AppController {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
  ) {}
  @Post('like_this')
  async likeThis(
    @Req() req: FastifyReply<IncomingMessage> & { session: any },
    @Res() res: FastifyReply<ServerResponse>,
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
