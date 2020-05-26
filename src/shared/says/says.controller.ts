/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-26 19:10:29
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/says/says.controller.ts
 * @Copyright
 */

import { Say } from '@libs/db/models/say.model'
import { Controller, Post, Body, Delete, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseCrud } from 'src/shared/base/base.controller'
import { SaysService } from 'src/shared/says/says.service'
import { WebEventsGateway } from '../../gateway/web/events.gateway'
import { EventTypes } from '../../gateway/events.types'
import { Auth } from '../../core/decorators/auth.decorator'
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

  @Post()
  @Auth()
  async post(@Body() body: Partial<Say>) {
    const r = await super.post(body)
    this.webgateway.broadcase(EventTypes.SAY_CREATE, r)
    return r
  }

  @Delete(':id')
  @Auth()
  async delete(@Param() params: IdDto) {
    await super.delete(params)
    this.webgateway.broadcase(EventTypes.SAY_DELETE, params.id)
    return 'OK'
  }
}
