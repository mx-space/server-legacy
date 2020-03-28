import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
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
    const { size } = query
    const { id } = params
    const condition = addCondition(isMaster)
    const currentDocument = await this.noteService.findOne({
      _id: id,
      ...condition,
    })
    if (!currentDocument) {
      throw new CannotFindException()
    }
    const prev = await this.noteService.findAsync(
      {
        created: {
          $gt: currentDocument.created,
        },
        ...condition,
      },
      { limit: 5, sort: { created: -1 } },
    )
    const next = await this.noteService.findAsync(
      {
        created: {
          $lt: currentDocument.created,
        },
        ...condition,
      },
      { limit: 4, sort: { created: -1 } },
    )

    return { prev, next, currentDocument }
  }
}
