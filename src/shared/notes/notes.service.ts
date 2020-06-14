/*
 * @Author: Innei
 * @Date: 2020-05-05 20:24:42
 * @LastEditTime: 2020-06-14 10:46:16
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/notes/notes.service.ts
 * @Coding with Love
 */

import Note from '@libs/db/models/note.model'
import { HttpService, Injectable } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { compareSync } from 'bcrypt'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { addConditionToSeeHideContent } from 'src/utils'
import { updateReadCount, updateLikeCount } from '../../utils/text-base'
import { WriteBaseService } from '../base/base.service'
import { RedisService } from 'nestjs-redis'

@Injectable()
export class NotesService extends WriteBaseService<Note> {
  constructor(
    @InjectModel(Note) private readonly noteModel: ReturnModelType<typeof Note>,
    private readonly http: HttpService,
    private readonly redis: RedisService,
  ) {
    super(noteModel, http)
  }

  async getLatestOne(isMaster: boolean) {
    const condition = addConditionToSeeHideContent(isMaster)
    // TODO master
    const latest = await this.noteModel
      .findOne({ ...condition, password: undefined })
      .sort({
        created: -1,
      })

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
      .select('nid _id')

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

  async likeNote(id: string, ip: string) {
    const doc = await this.noteModel.findById(id)
    if (!doc) {
      throw new CannotFindException()
    }

    return await updateLikeCount.call(this, doc, ip)
  }

  async shouldAddReadCount(doc: DocumentType<Note>, ip?: string) {
    return await updateReadCount.call(this, doc, ip)
  }
}
