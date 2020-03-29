import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { IdDto } from 'src/shared/base/dto/id.dto'
import { ListQueryDto, NidType, NoteDto } from 'src/shared/notes/dto/note.dto'
import { addCondition } from 'src/shared/utils'
import { NotesService } from './notes.service'
@ApiTags('Note Routes')
@Controller('notes')
@UseGuards(RolesGuard)
export class NotesController {
  constructor(private readonly noteService: NotesService) {}
  @Get('latest')
  @ApiOperation({ summary: '获取最新发布一篇随记' })
  @ApiHeader({ name: 'Referrer', required: false })
  async getLatestOne(
    @Master() isMaster: boolean,
    @Headers('Referrer') referrer: string,
  ) {
    const { latest, next } = await this.noteService.getLatestOne(isMaster)

    await this.noteService.shouldAddReadCount(referrer, latest)
    return { data: latest.toObject(), next: next.toObject() }
  }

  @Get(':id')
  @ApiHeader({ name: 'Referrer', required: false })
  async getOneNote(
    @Param() params: IdDto,
    @Master() isMaster: boolean,
    @Headers('Referrer') referrer: string,
  ) {
    const { id } = params
    const condition = addCondition(isMaster)
    const current = await this.noteService.findOne({
      _id: id,
      ...condition,
    })
    if (!current) {
      throw new CannotFindException()
    }
    await this.noteService.shouldAddReadCount(referrer, current)
    const prev = await this.noteService
      .findOne({
        ...condition,
        created: {
          $gt: current.created,
        },
      })
      .select('-text')
    const next = await this.noteService
      .findOne({
        ...condition,
        created: {
          $lt: current.created,
        },
      })
      .select('-text')
    return { data: current, next, prev }
  }

  @Get('/list/:id')
  @ApiParam({ name: 'id', example: '5e6f71c5c052ca214fba877a', type: 'string' })
  @ApiOperation({ summary: '以一篇随记为基准的中间 10 篇随记' })
  async getNoteList(
    @Query() query: ListQueryDto,
    @Param() params: IdDto,
    @Master() isMaster: boolean,
  ) {
    const { size = 10 } = query
    const half = Math.floor(size / 2)
    const { id } = params
    const select = 'nid _id title created'
    const condition = addCondition(isMaster)
    const currentDocument = await this.noteService
      .findOne({
        _id: id,
        ...condition,
      })
      .select(select)
    if (!currentDocument) {
      throw new CannotFindException()
    }
    const prevList =
      half - 1 === 0
        ? []
        : await this.noteService.findAsync(
            {
              created: {
                $gt: currentDocument.created,
              },
              ...condition,
            },
            { limit: half - 1 ?? 4, sort: { created: -1 }, select },
          )
    const nextList = !half
      ? []
      : await this.noteService.findAsync(
          {
            created: {
              $lt: currentDocument.created,
            },
            ...condition,
          },
          { limit: half ?? 5, sort: { created: -1 }, select },
        )
    const data = [...prevList, ...nextList, currentDocument].sort(
      (a: any, b: any) => b.created - a.created,
    )
    if (!data.length) {
      throw new CannotFindException()
    }
    return { data, size: data.length }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createNewNote(@Body() body: NoteDto) {
    const res = await this.noteService.createNew(body)
    return res
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async modifyNote(@Body() body: NoteDto, @Param() params: IdDto) {
    const { id } = params
    const res = await this.noteService.update({ _id: id }, body)
    return { ...res, msg: res.nModified ? '修改成功' : '没有内容被修改' }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteNote(@Param() params: IdDto) {
    return await this.noteService.deleteByIdAsync(params.id)
  }

  @ApiOperation({ summary: '根据 nid 查找' })
  @Get('/nid/:nid')
  @UseGuards(AuthGuard('jwt'))
  async getNoteByNid(
    @Param() params: NidType,
    @Master() isMaster: boolean,
    @Headers('Referrer') referrer: string,
  ) {
    const _id = await this.noteService.validNid(params.nid)
    return await this.getOneNote({ id: _id }, isMaster, referrer)
  }

  @ApiOperation({ summary: '根据 nid 修改' })
  @Put('/nid/:nid')
  @UseGuards(AuthGuard('jwt'))
  async modifyNoteByNid(@Param() params: NidType, @Body() body: NoteDto) {
    const _id = await this.noteService.validNid(params.nid)
    return await this.modifyNote(body, {
      id: _id,
    })
  }
}
