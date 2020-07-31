/*
 * @Author: Innei
 * @Date: 2020-05-14 11:46:35
 * @LastEditTime: 2020-07-08 21:37:16
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/backups/backups.controller.ts
 * @Coding with Love
 */

import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { TasksService } from '../../../libs/common/src/tasks/tasks.service'
import { Auth } from '../../core/decorators/auth.decorator'
import { BackupsService } from './backups.service'
@Controller({ path: 'backups', scope: Scope.REQUEST })
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
    @Res() res: FastifyReply,
  ) {
    res.send(this.service.getFileStream(dirname))
  }

  @Post()
  async newBackup() {
    this.taskService.backupDB()
    return 'OK'
  }
  @Patch(':dirname')
  async rollback(@Param('dirname') dirname: string, @Query('sid') sid: string) {
    if (!dirname) {
      throw new UnprocessableEntityException('参数有误')
    }

    this.service.rollbackTo(dirname, sid)
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
