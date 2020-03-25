import { Injectable } from '@nestjs/common'
import { BaseService } from '../base/base.service'
import Note from '@libs/db/models/note.model'
import { InjectModel } from 'nestjs-typegoose'
import { ReturnModelType } from '@typegoose/typegoose'

@Injectable()
export class NotesService extends BaseService<Note> {
  constructor(
    @InjectModel(Note) private readonly noteModel: ReturnModelType<typeof Note>,
  ) {
    super(noteModel)
  }
}
