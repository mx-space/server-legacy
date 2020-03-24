import { BaseModel } from '@libs/db/models/base.model'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { MongoError } from 'mongodb'
import { ModelPopulateOptions, Types } from 'mongoose'
import { AnyType } from 'src/shared/base/interfaces'

export type enumOrderType = 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1
export type OrderType<T> = {
  created?: enumOrderType
  modified?: enumOrderType
  [key: string]: enumOrderType
}

export type AsyncQueryList<T extends BaseModel> = Promise<
  Array<DocumentType<T>>
>
export type AsyncQueryListWithPaginator<T extends BaseModel> = Promise<{
  data: Array<DocumentType<T>>
  page: Paginator
}>
/**
 * 分页器返回结果
 * @export
 * @interface Paginator
 */
export interface Paginator {
  /**
   * 总条数
   */
  total: number
  /**
   * 一页多少条
   */
  size: number
  /**
   * 当前页
   */
  currentPage: number
  /**
   * 总页数
   */
  totalPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

@Injectable()
export abstract class BaseService<T extends BaseModel> {
  constructor(protected model: ReturnModelType<AnyParamConstructor<T>>) {}

  /**
   * @description 抛出mongodb异常
   * @protected
   * @static
   * @param {MongoError} err
   * @memberof BaseRepository
   */
  protected throwMongoError(err: MongoError): void {
    throw new InternalServerErrorException(err, err.errmsg)
  }

  /**
   * @description 将字符串转换成ObjectId
   * @protected
   * @static
   * @param {string} id
   * @returns {Types.ObjectId}
   * @memberof BaseRepository
   */
  protected toObjectId(id: string): Types.ObjectId {
    try {
      return Types.ObjectId(id)
    } catch (e) {
      this.throwMongoError(e)
    }
  }

  async findAll(): AsyncQueryList<T> {
    return await this.model.find()
  }

  async find(
    condition: AnyType,
    options: {
      lean?: boolean
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      [key: string]: AnyType
    } = {},
    filter: {
      sort?: OrderType<T>
      limit?: number
      skip?: number
      select?: string | Array<string>
    } = {
      sort: {},
    },
  ): AsyncQueryList<T> {
    return await this.model
      .find(condition, options)
      .sort(filter.sort)
      .limit(filter.limit)
      .skip(filter.skip)
      .select(filter.select)
  }

  async findWithPaginator(
    condition: AnyType = {},
    options: {
      lean?: boolean
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      [key: string]: AnyType
    } = {},
    filter: {
      sort?: OrderType<T>
      limit?: number
      skip?: number
      select?: string[] | string
    } = {
      sort: { created: -1 },
      limit: 10,
      skip: 0,
    },
  ): AsyncQueryListWithPaginator<T> {
    filter.limit = filter.limit ?? 10
    const queryList = await this.find(condition, options, filter)
    if (queryList.length === 0) {
      throw new BadRequestException('没有下页啦!')
    }
    const total = await this.countDocument(condition)
    const { skip = 0, limit = 10 } = filter
    const page = skip / limit + 1
    const totalPage = Math.ceil(total / limit)
    return {
      data: queryList,
      page: {
        total,
        size: queryList.length,
        currentPage: page,
        totalPage,
        hasPrevPage: totalPage > page,
        hasNextPage: page !== 1,
      },
    }
  }

  async countDocument(condition: AnyType): Promise<number> {
    return this.model.countDocuments(condition)
  }

  async findById(id: string, hide = false): Promise<DocumentType<T> | null> {
    const query = await this.model.findOne({
      _id: id,
      $or: [{ hide: false }, { hide }],
    } as any)
    if (!query) {
      throw new BadRequestException('此记录不存在')
    }
    return query
  }
  // async createNew()
}
