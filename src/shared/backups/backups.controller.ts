/*
 * @Author: Innei
 * @Date: 2020-05-14 11:46:35
 * @LastEditTime: 2020-06-07 13:44:39
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/backups/backups.controller.ts
 * @Coding with Love
 */

import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  Patch,
  UnprocessableEntityException,
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

  @Get('new')
  createNewBackup() {
    this.taskService.backupDB()
    return 'OK'
  }

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
  @Patch(':dirname')
  async rollback(@Param('dirname') dirname: string) {
    if (!dirname) {
      throw new UnprocessableEntityException('参数有误')
    }
    this.service.rollbackTo(dirname)
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
