/*
 * @Author: Innei
 * @Date: 2020-10-02 12:05:19
 * @LastEditTime: 2020-10-02 15:46:30
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/notes/notes.resolver.ts
 * @Mark: Coding with Love
 */
import Note from '@libs/db/models/note.model'
import {
  ForbiddenException,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { DocumentType } from '@typegoose/typegoose'
import { RolesGQLGuard } from 'apps/server/src/auth/roles.guard'
import { MasterGQL } from 'apps/server/src/core/decorators/guest.decorator'
import { CannotFindException } from 'apps/server/src/core/exceptions/cant-find.exception'
import { PermissionGQLInterceptor } from 'apps/server/src/core/interceptors/permission.interceptors'
import {
  addConditionToSeeHideContent,
  yearCondition,
} from 'apps/server/src/utils'
import { PagerArgsDto } from '../../graphql/args/id.input'
import {
  NoteItemAggregateModel,
  NotePagerModel,
} from '../../graphql/models/note.model'
import { NidOrIdArgsDto, PasswordArgsDto } from './notes.input'
import { NotesService } from './notes.service'

@Resolver()
@UseInterceptors(PermissionGQLInterceptor)
@UseGuards(RolesGQLGuard)
export class NotesResolver {
  constructor(private readonly service: NotesService) {}

  @Query(() => NoteItemAggregateModel)
  async getNoteById(
    @Args() args: NidOrIdArgsDto,
    @MasterGQL() isMaster: boolean,
    @Args() { password }: PasswordArgsDto,
  ) {
    const { id, nid } = args
    if (!id && !nid) {
      throw new UnprocessableEntityException('id or nid must choice one')
    }
    const currentNote = (await this.service.findOneByIdOrNid(
      id ?? nid,
    )) as DocumentType<Note>
    if (
      (!this.service.checkPasswordToAccess(currentNote, password) ||
        currentNote.hide) &&
      !isMaster
    ) {
      throw new ForbiddenException('不要偷看人家的小心思啦~')
    }
    const condition = addConditionToSeeHideContent(isMaster)
    const prev = await this.service
      .findOne({
        ...condition,
        created: {
          $gt: currentNote.created,
        },
      })
      .sort({ created: 1 })

    const next = await this.service
      .findOne({
        ...condition,
        created: {
          $lt: currentNote.created,
        },
      })
      .sort({ created: -1 })

    return { data: currentNote, next, prev }
  }

  @Query(() => NoteItemAggregateModel)
  async getLastestNote(@MasterGQL() isMaster: boolean) {
    const doc = (await this.service
      .findOne({})
      .sort({ created: -1 })) as DocumentType<Note>
    if (!doc) {
      throw new CannotFindException()
    }
    const id = doc._id.toString()
    return await this.getNoteById({ id }, isMaster, {})
  }

  @Query(() => NotePagerModel)
  async getNotesWithPager(
    @Args() args: PagerArgsDto,
    @MasterGQL() isMaster: boolean,
  ) {
    const { page, size, sortBy, sortOrder, year } = args
    const condition = {
      ...addConditionToSeeHideContent(isMaster),
      ...yearCondition(year),
    }
    return await this.service.findWithPaginator(condition, {
      limit: size,
      skip: (page - 1) * size,
      sort: sortBy ? { [sortBy]: sortOrder || -1 } : { created: -1 },
    })
  }
}
