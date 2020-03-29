import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { BaseService, QueryItem } from '../base/base.service'
import Note from '@libs/db/models/note.model'
import { InjectModel } from 'nestjs-typegoose'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'
import { addCondition } from 'src/shared/utils'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'

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
}
