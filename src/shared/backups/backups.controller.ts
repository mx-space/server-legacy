import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { ServerResponse } from 'http'
import { TasksService } from '../../../libs/common/src/tasks/tasks.service'
import { Auth } from '../../core/decorators/auth.decorator'
import { BackupsService } from './backups.service'
@Controller('backups')
@ApiTags('Backup Routes')
@Auth()
export class BackupsController {
  constructor(
    private readonly service: BackupsService,
    private readonly taskService: TasksService,
  ) {}

  @Get()
  async getBackups() {
    return this.service.getBackups()
  }

  @Get(':dirname')
  async downloadBackup(
    @Param('dirname') dirname: string,
    @Res() res: FastifyReply<ServerResponse>,
  ) {
    res.send(this.service.getFileStream(dirname))
  }

  @Post()
  async newBackup() {
    this.taskService.backupDB()
    return 'OK'
  }
  @Delete()
  async deleteBackup(@Query('files') files: string) {
    if (!files) {
      return
    }
    const _files = files.split(',')
    for await (const f of _files) {
      await this.service.deleteBackup(f)
    }
    return 'OK'
  }
}
