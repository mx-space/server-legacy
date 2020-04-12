import { BaseModel } from '@libs/db/models/base.model'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { FindAndModifyWriteOpResultObject, MongoError } from 'mongodb'
import {
  DocumentQuery,
  FilterQuery,
  ModelPopulateOptions,
  Query,
  QueryFindOneAndRemoveOptions,
  QueryFindOneAndUpdateOptions,
  QueryUpdateOptions,
  Types,
} from 'mongoose'
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

export type QueryItem<T extends BaseModel> = DocumentQuery<
  DocumentType<T>,
  DocumentType<T>
>
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
   */
  protected static throwMongoError(err: MongoError): never {
    throw new InternalServerErrorException(err, err.errmsg)
  }

  protected throwMongoError(err: MongoError): never {
    BaseService.throwMongoError(err)
  }
  /**
   * @description 将字符串转换成ObjectId
   * @protected
   * @static
   * @param {string} id
   * @returns {Types.ObjectId}
   */
  protected static toObjectId(id: string): Types.ObjectId {
    try {
      return Types.ObjectId(id)
    } catch (e) {
      this.throwMongoError(e)
    }
  }

  protected toObjectId(id: string): Types.ObjectId {
    return BaseService.toObjectId(id)
  }

  public findAll() {
    return this.model.find()
  }

  /**
   * 根据条件查找
   */
  // FIXME async maybe cause some bugs
  public async find(
    condition: FilterQuery<T>,
    options: {
      lean?: boolean
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      populate?: string | Array<string>
      [key: string]: AnyType
      sort?: OrderType<T>
      limit?: number
      skip?: number
      select?: string | Array<string>
    } = {},
  ) {
    return this.model.find(condition as any).setOptions(options)
  }
  public async findAsync(
    condition: FilterQuery<T>,
    options: {
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      populate?: string | Array<string>
      [key: string]: AnyType
      sort?: OrderType<T>
      limit?: number
      skip?: number
      select?: string | Array<string>
    } = {},
  ): AsyncQueryList<T> {
    return await this.model
      .find(condition as any)
      .setOptions(options)
      .lean()
  }

  public async findWithPaginator(
    condition: FilterQuery<T> = {},
    options: {
      lean?: boolean
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      populate?: string | Array<string>
      [key: string]: AnyType
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
    options.limit = options.limit ?? 10
    const queryList = await this.findAsync(condition, options)
    if (queryList.length === 0) {
      throw new BadRequestException('没有下页啦!')
    }
    const total = await this.countDocument(condition)
    const { skip = 0, limit = 10 } = options
    const page = skip / limit + 1
    const totalPage = Math.ceil(total / limit)
    return {
      data: queryList,
      page: {
        total,
        size: queryList.length,
        currentPage: page,
        totalPage,
        hasPrevPage: page !== 1,
        hasNextPage: totalPage > page,
      },
    }
  }

  public async countDocument(condition: AnyType): Promise<number> {
    return this.model.countDocuments(condition)
  }

  public async findByIdAsync(id: string | Types.ObjectId): Promise<T> {
    const query = await this.model.findById(id).lean().sort({ created: -1 })
    if (!query) {
      throw new BadRequestException('此记录不存在')
    }
    return query as T
  }

  public findById(
    id: string,
    projection?: object | string,
    options: {
      lean?: boolean
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      [key: string]: AnyType
    } = {},
  ): QueryItem<T> {
    return this.model.findById(this.toObjectId(id), projection, options)
  }
  /**
   * @description 获取单条数据
   * @param {*} conditions
   * @param {(Object | string)} [projection]
   * @param {({
   *     lean?: boolean;
   *     populates?: ModelPopulateOptions[] | ModelPopulateOptions;
   *     [key: string]: any;
   *   })} [options]
   * @returns {QueryItem<T>}
   */
  public findOne(
    conditions: FilterQuery<T>,
    projection?: object | string,
    options: {
      lean?: boolean
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      [key: string]: AnyType
    } = {},
  ): QueryItem<T> {
    return this.model.findOne(conditions as any, projection || {}, options)
  }

  public async findOneAsync(
    conditions: AnyType,
    projection?: object | string,
    options: {
      populates?: ModelPopulateOptions[] | ModelPopulateOptions
      [key: string]: AnyType
    } = {},
  ): Promise<T> {
    const { ...option } = options
    const docsQuery = await this.findOne(
      conditions,
      projection || {},
      option,
    ).lean()
    return docsQuery as T
  }

  /**
   * @description 创建一条数据
   * @param {Partial<T>} docs
   * @returns {Promise<DocumentType<T>>}
   */
  async createNew(data: Partial<T>): Promise<DocumentType<T>> {
    return await this.model.create(data)
  }
  /**
   * @description 删除指定数据
   * @param {(any)} id
   * @param {QueryFindOneAndRemoveOptions} options
   * @returns {QueryItem<T>}
   */
  public delete(
    conditions: AnyType,
    options?: QueryFindOneAndRemoveOptions,
  ): QueryItem<T> {
    return this.model.findOneAndDelete(conditions, options)
  }
  public async deleteAsync(
    conditions: AnyType,
    options?: QueryFindOneAndRemoveOptions,
  ): Promise<DocumentType<T>> {
    return await this.delete(conditions, options).exec()
  }

  /**
   * @description 删除指定id数据
   * @param {(any)} id
   * @param {QueryFindOneAndRemoveOptions} options
   * @returns {Query<FindAndModifyWriteOpResultObject<DocumentType<T>>>}
   */
  public findAndDeleteById(
    id: string | Types.ObjectId,
    options?: QueryFindOneAndRemoveOptions,
  ): Query<FindAndModifyWriteOpResultObject<DocumentType<T>>> {
    return this.model.findByIdAndDelete(this.toObjectId(id as string), options)
  }

  public async findAndDeleteByIdAsync(
    id: string | Types.ObjectId,
    options?: QueryFindOneAndRemoveOptions,
  ): Promise<FindAndModifyWriteOpResultObject<DocumentType<T>>> {
    return await this.findAndDeleteById(id, options).exec()
  }

  public deleteOne(conditions: AnyType) {
    return this.model.deleteOne(conditions)
  }

  public async deleteOneAsync(conditions: AnyType) {
    const r = await this.deleteOne(conditions)
    return { ...r, msg: r.deletedCount ? '删除成功' : '删除失败' }
  }

  public async deleteByIdAsync(id: string) {
    if (Types.ObjectId.isValid(id)) {
      return await this.deleteOneAsync({
        _id: id,
      })
    }
    throw new TypeError('_id muse be MongoId')
  }
  /**
   * @description 更新指定id数据
   * @param {string} id
   * @param {Partial<T>} update
   * @param {QueryFindOneAndUpdateOptions}
   * @returns {QueryItem<T>}
   */
  public updateById(
    id: string,
    update: Partial<T>,
    options: QueryFindOneAndUpdateOptions = { omitUndefined: true },
  ): QueryItem<T> {
    return this.model.findByIdAndUpdate(this.toObjectId(id), update, options)
  }

  async updateByIdAsync(
    id: string,
    update: Partial<T>,
    options: QueryFindOneAndUpdateOptions = {},
  ): Promise<DocumentType<T>> {
    const res = await this.updateById(id, update, options)
    const obj = res.toObject()
    return { ...obj }
  }

  /**
   * @description 更新指定数据
   * @param {any} conditions
   * @param {Partial<T>} update
   * @param {QueryFindOneAndUpdateOptions}
   * @returns {Query<any>}
   */
  public update(
    conditions: FilterQuery<T>,
    doc: Partial<T>,
    options: QueryUpdateOptions = { omitUndefined: true },
  ): Query<any> {
    return this.model.updateOne(conditions as any, doc, options)
  }

  public async updateAsync(
    conditions: FilterQuery<T>,
    doc: Partial<T>,
    options: QueryUpdateOptions = { omitUndefined: true },
  ) {
    const res = await this.update(conditions as any, doc, options)
    return res.nModified > 0
      ? { msg: '修改成功啦~' }
      : { msg: '没有内容被修改' }
  }
}
