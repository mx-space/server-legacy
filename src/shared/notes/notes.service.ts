import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { BaseService } from '../base/base.service'
import Note from '@libs/db/models/note.model'
import { InjectModel } from 'nestjs-typegoose'
import { ReturnModelType } from '@typegoose/typegoose'
import { addCondition } from 'src/shared/utils'

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
      throw new UnprocessableEntityException('真不巧，日志走丢了')
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
}
