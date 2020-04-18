import { BaseModel } from '@libs/db/models/base.model'
import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { Auth } from 'src/core/decorators/auth.decorator'
import { BaseService } from './base.service'
import { IdDto } from './dto/id.dto'
import { PagerDto } from './dto/pager.dto'

export abstract class BaseCrud<
  T extends BaseModel,
  U extends Partial<T> = Partial<T>
> {
  constructor(private readonly _service: BaseService<T>) {}

  @Get(':id')
  async get(@Param() param: IdDto) {
    const { id } = param
    return await this._service.findByIdAsync(id)
  }

  @Get()
  async gets(@Query() pager: PagerDto) {
    const { size, page, select } = pager
    return await this._service.findWithPaginator(
      {},
      {
        limit: size,
        skip: (page - 1) * size,
        sort: { created: -1 },
        select,
      },
    )
  }

  @Post()
  @Auth()
  async post(@Body() body: U) {
    return await this._service.createNew(body)
  }

  @Put(':id')
  @Auth()
  async put(@Body() body: U, @Param() param: IdDto) {
    return await this._service.updateAsync({ _id: param.id as any }, body)
  }

  @Delete(':id')
  @Auth()
  async delete(@Param() param: IdDto) {
    return await this._service.deleteAsync({ _id: param.id })
  }
}
