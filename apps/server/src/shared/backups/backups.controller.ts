/*
 * @Author: Innei
 * @Date: 2020-05-14 11:46:35
 * @LastEditTime: 2020-07-31 21:28:05
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/backups/backups.controller.ts
 * @Coding with Love
 */

import { TasksService } from '@libs/common/tasks/tasks.service'
import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ApiProperty, ApiResponseProperty, ApiTags } from '@nestjs/swagger'
import { ApplyUpload } from 'shared/core/decorators/file.decorator'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Readable } from 'stream'
import { Auth } from '../../../../../shared/core/decorators/auth.decorator'
import { UploadsService } from '../uploads/uploads.service'
import { BackupsService } from './backups.service'

@Controller({ path: 'backups', scope: Scope.REQUEST })
@ApiTags('Backup Routes')
@Auth()
export class BackupsController {
  constructor(
    private readonly service: BackupsService,
    private readonly taskService: TasksService,
    private readonly uploadService: UploadsService,
  ) {}

  @Get('new')
  @ApiResponseProperty({ type: 'string', format: 'binary' })
  createNewBackup(@Res() res: FastifyReply) {
    const buffer = this.taskService.backupDB({ uploadCOS: false })
    const stream = new Readable()

    stream.push(buffer)
    stream.push(null)
    res
      .header(
        'Content-Disposition',
        `attachment; filename="backup-${new Date().toISOString()}.zip"`,
      )
      .type('application/zip')
      .send(stream)
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
  @ApiProperty({ description: '上传备份恢复' })
  @ApplyUpload({ description: 'Upload backup and restore' })
  async uploadAndRestore(@Req() req: FastifyRequest) {
    const data = await this.uploadService.validMultipartField(req)
    const { mimetype } = data
    if (mimetype !== 'application/zip') {
      throw new UnprocessableEntityException('备份格式必须为 application/zip')
    }

    this.service.saveTempBackupByUpload(await data.toBuffer())

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
