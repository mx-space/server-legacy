/*
 * @Author: Innei
 * @Date: 2020-05-05 20:24:42
 * @LastEditTime: 2021-02-04 15:15:11
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/shared/notes/notes.service.ts
 * @Coding with Love
 */

import Note from '@libs/db/models/note.model'
import { HttpService, Injectable } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { compareSync } from 'bcrypt'
import { RedisService } from 'nestjs-redis'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'shared/core/exceptions/cant-find.exception'
import { addConditionToSeeHideContent } from 'shared/utils'
import {
  updateLikeCount,
  updateReadCount,
} from '../../../../../shared/utils/text-base'
import { ConfigsService } from '../../../../../shared/global'
import { WriteBaseService } from '../base/base.service'
import { Types } from 'mongoose'

@Injectable()
export class NotesService extends WriteBaseService<Note> {
  constructor(
    @InjectModel(Note) private readonly noteModel: ReturnModelType<typeof Note>,
    private readonly http: HttpService,
    private readonly redis: RedisService,
    private readonly configs: ConfigsService,
  ) {
    super(noteModel, http, configs)

    // create default note

    this.noteModel.countDocuments({}).then((count) => {
      if (!count) {
        this.createNew({
          title: '第一篇日记',
          text: 'Hello World',
        })
      }
    })
  }

  async getLatestOne(isMaster: boolean) {
    const condition = addConditionToSeeHideContent(isMaster)
    // TODO master
    const latest = await this.noteModel
      .findOne({ ...condition, password: undefined })
      .sort({
        created: -1,
      })
      .select(isMaster ? '' : '-location -coordinates -password')

    if (!latest) {
      throw new CannotFindException()
    }

    // 是否存在上一条记录 (旧记录)
    // 统一: next 为较老的记录  prev 为较新的记录
    // FIXME may cause bug
    const next = await this.noteModel
      .findOne({
        created: {
          $lt: latest.created,
        },
      })
      .sort({
        created: -1,
      })
      .select((isMaster ? '' : '-location -coordinates -password ') + 'nid _id')

    return {
      latest,
      next,
    }
  }

  /**
   * 查找 nid 时候正确，返回 _id 或者抛出异常
   *
   * @param {number} nid
   * @returns {Types.ObjectId}
   */
  async validNid(nid: number) {
    const document = await this.findOne({
      nid,
    })
    if (!document) {
      throw new CannotFindException()
    }
    return document._id
  }

  checkPasswordToAccess(doc: DocumentType<Note>, password: string): boolean {
    const hasPassword = doc.password
    if (!hasPassword) {
      return true
    }
    if (!password) {
      return false
    }
    const isValid = compareSync(password, doc.password)
    return isValid
  }

  async likeNote(id: string | number, ip: string) {
    const isMongoId = Types.ObjectId.isValid(id)
    const doc = isMongoId
      ? await this.noteModel.findById(id)
      : await this.noteModel.findOne({
          nid: id as number,
        })
    if (!doc) {
      throw new CannotFindException()
    }

    return await updateLikeCount.call(this, doc, ip)
  }

  async shouldAddReadCount(doc: DocumentType<Note>, ip?: string) {
    return await updateReadCount.call(this, doc, ip)
  }
}
