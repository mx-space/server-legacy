import {
  Controller,
  Get,
  Delete,
  Query,
  Post,
  Param,
  Res,
} from '@nestjs/common'
import { BackupsService } from './backups.service'
import { TasksService } from '../../../libs/common/src/tasks/tasks.service'
import { FastifyReply } from 'fastify'
import { ServerResponse } from 'http'
@Controller('backups')
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
