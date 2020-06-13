import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ReturnModelType } from '@typegoose/typegoose'
import { execSync } from 'child_process'
import * as COS from 'cos-nodejs-sdk-v5'
import { existsSync } from 'fs'
import * as mkdirp from 'mkdirp'
import { RedisService } from 'nestjs-redis'
import { InjectModel } from 'nestjs-typegoose'
import { join } from 'path'
import { ConfigsService } from '../../../../src/configs/configs.service'
import { BackupsService } from '../../../../src/shared/backups/backups.service'
import { Analyze } from '../../../db/src/models/analyze.model'
import { RedisNames } from '../redis/redis.types'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  constructor(
    private readonly configs: ConfigsService,
    @InjectModel(Analyze)
    private readonly analyzeModel: ReturnModelType<typeof Analyze>,
    private readonly redisCtx: RedisService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_10PM, { name: 'backup' })
  backupDB() {
    if (
      !this.configs.get('backupOptions').enable ||
      process.env.NODE_ENV === 'development'
    ) {
      return
    }
    this.logger.log('--> 备份数据库中')

    const dateDir = this.nowStr
    const backupDirPath = join(BackupsService.backupPath, dateDir)
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
      this.logger.error(
        '--> 备份失败, 请确保已安装 zip 或 mongo-tools, mongo-tools 的版本需要与 mongod 版本一致',
      )
      return
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
        (err) => {
          if (!err) {
            this.logger.log('--> 上传成功')
          } else {
            this.logger.error('--> 上传失败了' + err)
          }
        },
      )
    })
  }
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'clear_access',
  })
  async clearAccessRecord() {
    const now = new Date().getTime()
    const rmBeforeDate = new Date(now - 7 * 60 * 60 * 24 * 1000)

    await this.analyzeModel.deleteMany({
      timestamp: {
        $lte: rmBeforeDate,
      },
    })
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'reset_ua' })
  async resetIPAccess() {
    await this.redisCtx.getClient(RedisNames.Access).set('ips', '[]')
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'reset_like_article' })
  async resetLikedArticleRecord() {
    const likeStore = this.redisCtx.getClient(RedisNames.Like)
    const keys = await likeStore.keys('*mx_like*')
    keys.forEach((key) => {
      likeStore.del(key.split('_').pop())
    })
  }
  get nowStr() {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const nowStr = `${year}-${month}-${day}`
    return nowStr
  }
}
