import Note from '@libs/db/models/note.model'
import { Injectable } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { addCondition } from 'src/shared/utils'
import { BaseService } from '../base/base.service'

@Injectable()
export class NotesService extends BaseService<Note> {
  constructor(
    @InjectModel(Note) private readonly noteModel: ReturnModelType<typeof Note>,
  ) {
    super(noteModel)
  }

  async getLatestOne(isMaster: boolean) {
    const condition = addCondition(isMaster)
    const latest = await this.noteModel.findOne(condition).sort({
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

  async shouldAddReadCount(
    condition: boolean | any,
    document: DocumentType<Note>,
  ) {
    if (condition) {
      return await document.updateOne({
        $inc: {
          'count.read': 1,
        },
      })
    }
    return null
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
}
