import { BaseModel } from '@libs/db/models/base.model'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Type,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { getModelForClass } from '@typegoose/typegoose'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { Auth } from 'src/core/decorators/auth.decorator'
import { BaseService } from './base.service'
import { IdDto } from './dto/id.dto'
import { PagerDto } from './dto/pager.dto'

export function BaseCrudFactory<
  U extends BaseModel,
  T extends AnyParamConstructor<U>
>({ prefix, dto, model }: { prefix: string; dto: any; model: T }): Type<any> {
  const _model = getModelForClass(model)
  const _service = new BaseService(_model)

  const tagPrefix =
    prefix.charAt(0).toUpperCase() + prefix.slice(1, prefix.length - 1)
  @ApiTags(tagPrefix + ' Routes')
  @Controller(prefix)
  class BaseCrud {
    @Get(':id')
    async get(@Param() param: IdDto) {
      const { id } = param
      return await _service.findByIdAsync(id)
    }

    @Get()
    async gets(@Query() pager: PagerDto) {
      const { size, page, select } = pager
      return await _service.findWithPaginator(
        {},
        {
          limit: size,
          skip: (page - 1) * size,
          sort: { created: -1 },
          select,
        },
      )
    }
    @Get('all')
    async getAll() {
      return await _service.find({})
    }

    @Post()
    @Auth()
    async post(@Body() body: typeof dto) {
      return await _service.createNew(body)
    }

    @Put(':id')
    @Auth()
    async put(@Body() body: typeof dto, @Param() param: IdDto) {
      return await _service.updateAsync({ _id: param.id as any }, body)
    }

    @Delete(':id')
    @Auth()
    async delete(@Param() param: IdDto) {
      return await _service.deleteAsync({ _id: param.id })
    }
  }

  return BaseCrud
}

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
    const { size, page, select, state } = pager

    return await this._service.findWithPaginator(
      // @ts-ignore
      state !== undefined ? { state } : {},
      {
        limit: size,
        skip: (page - 1) * size,
        sort: { created: -1 },
        select,
      },
    )
  }
  @Get('all')
  async getAll() {
    return await this._service.find({})
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
    await this._service.deleteAsync({ _id: param.id })
    return 'OK'
  }
}
