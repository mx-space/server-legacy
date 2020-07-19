import {
  BaseModel,
  TextImageRecordType,
  WriteBaseModel,
} from '@libs/db/models/base.model'
import {
  BadRequestException,
  HttpService,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { ISizeCalculationResult } from 'image-size/dist/types/interface'
import { FindAndModifyWriteOpResultObject, MongoError } from 'mongodb'
import {
  DocumentQuery,
  FilterQuery,
  ModelPopulateOptions,
  Query,
  QueryFindBaseOptions,
  QueryFindOneAndRemoveOptions,
  QueryFindOneAndUpdateOptions,
  QueryUpdateOptions,
  Types,
  UpdateQuery,
} from 'mongoose'
import { AnyType } from 'src/shared/base/interfaces'
import { gatewayMessageFormat } from '../../gateway/base.gateway'
import { EventTypes } from '../../gateway/events.types'
import { getOnlineImageSize, pickImagesFromMarkdown } from '../../utils/pic'

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

export interface QueryOptions<T = any> {
  lean?: boolean
  populate?:
    | string
    | Array<string>
    | ModelPopulateOptions[]
    | ModelPopulateOptions
  [key: string]: AnyType
  sort?: OrderType<T>
  limit?: number
  skip?: number
  select?: string[] | string
}
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

export class BaseService<T extends BaseModel> {
  constructor(private _model: ReturnModelType<AnyParamConstructor<T>>) {}

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
    return this._model.find()
  }

  /**
   * 根据条件查找
   */
  // FIXME async maybe cause some bugs
  public async find(condition: FilterQuery<T>, options: QueryOptions = {}) {
    return this._model.find(condition as any).setOptions(options)
  }
  public async findAsync(
    condition: FilterQuery<T>,
    options: QueryOptions<T> = {},
  ): AsyncQueryList<T> {
    return await this._model.find(condition as any).setOptions(options)
  }

  public async findWithSimplePager(page = 1, size = 10) {
    return this.findWithPaginator({}, { limit: size, skip: (page - 1) * size })
  }

  public async findWithPaginator(
    condition: FilterQuery<T> = {},
    options: QueryOptions<T> = {
      sort: { created: -1 },
      limit: 10,
      skip: 0,
    },
  ): AsyncQueryListWithPaginator<T> {
    options.limit = options.limit ?? 10
    const queryList = await this.findAsync(condition, options)
    if (queryList.length === 0 && options.skip !== 0) {
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
    return this._model.countDocuments(condition)
  }

  public async findByIdAsync(id: string | Types.ObjectId): Promise<T> {
    const query = await this._model.findById(id).sort({ created: -1 })
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
    return this._model.findById(this.toObjectId(id), projection, options)
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
    options:
      | QueryFindBaseOptions
      | ({ lean: true } & Omit<QueryFindBaseOptions, 'lean'>) = {},
  ): QueryItem<T> {
    return this._model.findOne(conditions as any, projection || {}, options)
  }

  public async findOneAsync(
    conditions: AnyType,
    projection?: object | string,
    options:
      | QueryFindBaseOptions
      | ({ lean: true } & Omit<QueryFindBaseOptions, 'lean'>) = {},
  ): Promise<T> {
    const { ...option } = options
    const docsQuery = await this.findOne(conditions, projection || {}, option)
    return docsQuery as T
  }

  /**
   * @description 创建一条数据
   * @param {Partial<T>} docs
   * @returns {Promise<DocumentType<T>>}
   */
  async createNew(data: Partial<T>): Promise<DocumentType<T>> {
    return await this._model.create(data)
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
    return this._model.findOneAndDelete(conditions, options)
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
    return this._model.findByIdAndDelete(this.toObjectId(id as string), options)
  }

  public async findAndDeleteByIdAsync(
    id: string | Types.ObjectId,
    options?: QueryFindOneAndRemoveOptions,
  ): Promise<FindAndModifyWriteOpResultObject<DocumentType<T>>> {
    return await this.findAndDeleteById(id, options).exec()
  }

  public deleteOne(conditions: AnyType) {
    return this._model.deleteOne(conditions)
  }

  public async deleteOneAsync(conditions: AnyType) {
    const r = await this.deleteOne(conditions)
    return { ...r, message: r.deletedCount ? '删除成功' : '删除失败' }
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
    return this._model.findByIdAndUpdate(
      this.toObjectId(id),
      update as any,
      options,
    )
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
    doc: UpdateQuery<T>,
    options: QueryUpdateOptions = { omitUndefined: true },
  ): Query<any> {
    return this._model.updateOne(conditions as any, doc as any, options)
  }

  public async updateAsync(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options: QueryUpdateOptions = { omitUndefined: true },
  ) {
    const res = await this.update(conditions as any, doc, options)
    return res.nModified > 0
      ? { message: '修改成功啦~' }
      : { message: '没有内容被修改' }
  }
}
export class WriteBaseService<T extends WriteBaseModel> extends BaseService<T> {
  private logger: Logger
  constructor(
    private __model: ReturnModelType<AnyParamConstructor<T>>,
    private readonly __http: HttpService,
  ) {
    super(__model)
    this.logger = new Logger(WriteBaseService.name)
  }

  async RecordImageDimensions(id: string, socket?: SocketIO.Socket) {
    const document = await this.__model.findById(id).lean()
    const { text } = document
    const originImages: TextImageRecordType[] = document.images || []
    const images = pickImagesFromMarkdown(text)
    const result = [] as TextImageRecordType[]
    // eslint-disable-next-line prefer-const
    for await (let [i, src] of images.entries()) {
      if (
        originImages[i] &&
        originImages[i].src === src &&
        Object.values(originImages[i]).every(Boolean)
      ) {
        result.push(originImages[i])
        continue
      }
      try {
        const url = new URL(src)
        if (url.host.match(/sinaimg.cn$/)) {
          url.host = url.host.replace(/.*?.sinaimg.cn/, 'tva2.sinaimg.cn')
          src = url.toString()
        }
        this.logger.log('Get --> ' + src)
        const size = await getOnlineImageSize(this.__http, src)
        if (socket) {
          socket.send(
            gatewayMessageFormat(
              EventTypes.IMAGE_FETCH,
              'Get --> ' + src + JSON.stringify(size),
            ),
          )
        }
        result.push({ ...size, src: src })
      } catch (e) {
        this.logger.error(`GET --> ${src} ${e.message}`)
        if (socket) {
          socket.send(gatewayMessageFormat(EventTypes.IMAGE_FETCH, e.message))
        }
        result.push({
          width: undefined,
          height: undefined,
          type: undefined,
          src: src,
        })
      }
    }

    await this.__model.updateOne(
      { _id: id as any },
      // @ts-ignore
      { $set: { images: result } },
    )
  }

  refreshImageSize(ws?: SocketIO.Socket) {
    this.__model.find().then((res) => {
      res.forEach((n) => {
        this.RecordImageDimensions(n._id, ws)
      })
    })
  }
}
