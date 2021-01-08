/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-09-27 22:52:03
 * @LastEditors: Innei
 * @FilePath: /server/src/shared/says/says.controller.ts
 * @Copyright
 */

import { Say } from '@libs/db/models/say.model'
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { sample } from 'lodash'
import { CannotFindException } from 'shared/core/exceptions/cant-find.exception'
import { BaseCrud } from 'apps/server/src/shared/base/base.controller'
import { SaysService } from 'apps/server/src/shared/says/says.service'
import { Auth } from '../../../../../shared/core/decorators/auth.decorator'
import { EventTypes } from '../../gateway/events.types'
import { WebEventsGateway } from '../../gateway/web/events.gateway'
import { IdDto } from '../base/dto/id.dto'

@Controller('says')
@ApiTags('Says Routes')
export class SaysController extends BaseCrud<Say> {
  constructor(
    private readonly service: SaysService,
    private readonly webgateway: WebEventsGateway,
  ) {
    super(service)
  }

  @Get('random')
  async getRandomOne() {
    const res = await this.service.find({})
    if (!res.length) {
      throw new CannotFindException()
    }
    return sample(res)
  }

  @Post()
  @Auth()
  async post(@Body() body: Partial<Say>) {
    const r = await super.post(body)
    this.webgateway.broadcast(EventTypes.SAY_CREATE, r)
    return r
  }

  @Delete(':id')
  @Auth()
  async delete(@Param() params: IdDto) {
    await super.delete(params)
    this.webgateway.broadcast(EventTypes.SAY_DELETE, params.id)
    return 'OK'
  }
}
