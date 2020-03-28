import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags, ApiHeader } from '@nestjs/swagger'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { ListQueryDto } from 'src/shared/notes/dto/note.dto'
import { addCondition } from 'src/shared/utils'
import { NotesService } from './notes.service'
import { IdDto } from 'src/shared/base/dto/id.dto'
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
    if (referrer) {
      await latest.updateOne({
        $inc: {
          'count.read': 1,
        },
      })
    }
    await latest.save()

    return { data: latest.toObject(), next: next.toObject() }
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
}
