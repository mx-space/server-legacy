/*
 * @Author: Innei
 * @Date: 2020-10-02 14:44:46
 * @LastEditTime: 2020-10-02 15:42:18
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/notes/notes.service.ts
 * @Mark: Coding with Love
 */
import Note from '@libs/db/models/note.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { compareSync } from 'bcrypt'
import { isMongoId } from 'class-validator'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from '../base/base.service'
import { DocumentType } from '@typegoose/typegoose'
@Injectable()
export class NotesService extends BaseService<Note> {
  constructor(
    @InjectModel(Note) private readonly model: ReturnModelType<typeof Note>,
  ) {
    super(model)
  }

  async findOneByIdOrNid(unique: any) {
    const res = isMongoId(unique)
      ? await super.findByIdException(unique)
      : await super.findOneAsyncException({
          nid: unique,
        })

    return res
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
}
