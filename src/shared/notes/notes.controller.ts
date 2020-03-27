import { Controller, Get, Headers, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
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
}
