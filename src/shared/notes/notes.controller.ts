import {
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { ListQueryDto } from 'src/shared/notes/dto/note.dto'
import { NotesService } from './notes.service'

@ApiTags('Note Routes')
@Controller('notes')
@UseGuards(RolesGuard)
export class NotesController {
  constructor(private readonly noteService: NotesService) {}
  @Get('latest')
  @ApiOperation({ summary: '获取最新发布一篇随记' })
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
  async getNoteList(@Query() query: ListQueryDto) {
    const { size } = query
    // TODO
  }
}
