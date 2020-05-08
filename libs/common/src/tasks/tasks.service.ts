import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { execSync } from 'child_process'
import * as mkdirp from 'mkdirp'
import { resolve } from 'path'
import { homedir } from 'os'
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  // constructor() {
  //   this.backupDB()
  // }
  @Cron(CronExpression.EVERY_DAY_AT_10PM, { name: 'backup' })
  backupDB() {
    this.logger.log('--> 备份数据库中')
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dateDir = `${year}-${month}-${day}`
    mkdirp.sync('~/.mx-space/backup/' + dateDir)
    try {
      execSync(
        'mongodump -h 127.0.0.1 -d mx-space -o ~/.mx-space/backup/' + dateDir,
      )

      execSync('zip -r backup-' + dateDir + ' mx-space/* && rm -r mx-space', {
        cwd: resolve(homedir(), '.mx-space/backup/' + dateDir),
      })
    } catch {
      this.logger.error('--> 备份失败, 请确保已安装 zip 或 mongotools')
    }

    this.logger.log('--> 备份成功')
  }
}
