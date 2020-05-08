import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { execSync } from 'child_process'
import * as COS from 'cos-nodejs-sdk-v5'
import { existsSync } from 'fs'
import * as mkdirp from 'mkdirp'
import { homedir } from 'os'
import { join } from 'path'
import { ConfigsService } from '../../../../src/configs/configs.service'
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  constructor(private readonly configs: ConfigsService) {}
  @Cron(CronExpression.EVERY_DAY_AT_10PM, { name: 'backup' })
  backupDB() {
    if (!this.configs.get('backupOptions').enable) {
      return
    }
    this.logger.log('--> 备份数据库中')
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dateDir = `${year}-${month}-${day}`
    const backupDirPath = join(homedir(), '.mx-space/backup/' + dateDir)
    mkdirp.sync(backupDirPath)
    try {
      execSync(
        'mongodump -h 127.0.0.1 -d mx-space -o ~/.mx-space/backup/' +
          dateDir +
          ' >/dev/null 2>&1',
      )
      execSync('zip -r backup-' + dateDir + ' mx-space/* && rm -r mx-space', {
        cwd: backupDirPath,
      })
      this.logger.log('--> 备份成功')
    } catch {
      this.logger.error('--> 备份失败, 请确保已安装 zip 或 mongotools')
    }
    new Promise(() => {
      const backupOptions = this.configs.get('backupOptions')
      if (
        !backupOptions.Bucket ||
        !backupOptions.Region ||
        !backupOptions.SecretId ||
        !backupOptions.SecretKey
      ) {
        return
      }
      const backupFilePath = join(backupDirPath, 'backup-' + dateDir + '.zip')

      if (!existsSync(backupFilePath)) {
        this.logger.warn('文件不存在, 无法上传到 COS')
        return
      }
      this.logger.log('--> 开始上传到 COS')
      const cos = new COS({
        SecretId: backupOptions.SecretId,
        SecretKey: backupOptions.SecretKey,
      })
      // 分片上传
      cos.sliceUploadFile(
        {
          Bucket: backupOptions.Bucket,
          Region: backupOptions.Region,
          Key: `backup-${dateDir}.zip`,
          FilePath: backupFilePath,
        },
        (err, data) => {
          if (!err) {
            this.logger.log('--> 上传成功')
          } else {
            this.logger.error('--> 上传失败了' + err)
          }
        },
      )
    })
  }
}
