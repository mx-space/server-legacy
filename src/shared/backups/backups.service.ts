/*
 * @Author: Innei
 * @Date: 2020-05-14 11:46:26
 * @LastEditTime: 2020-06-07 14:23:47
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/backups/backups.service.ts
 * @Coding with Love
 */

import {
  Injectable,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common'
import { execSync } from 'child_process'
import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  rmdirSync,
} from 'fs'
import { homedir } from 'os'
import { join, resolve } from 'path'
import { Readable } from 'stream'
import getFolderSize = require('get-folder-size')
@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name)
  constructor() {
    this.rollbackTo('2020-6-6')
  }
  public static backupPath =
    process.env.NODE_ENV === 'production'
      ? join(homedir(), '.mx-space/backup/')
      : join(__dirname, '../tmp', 'backup')

  async getBackups() {
    const backupPath = BackupsService.backupPath
    if (!existsSync(backupPath)) {
      return []
    }
    const backupFilenames = readdirSync(backupPath)
    const backups = []
    for await (const filename of backupFilenames) {
      const path = resolve(backupPath, filename)

      backups.push({
        filename,
        size: await this.getFolderSize(path),
      })
    }
    return backups
  }

  async getFolderSize(folderPath: string) {
    return new Promise((resolve, reject) => {
      getFolderSize(folderPath, function (err, size) {
        if (err) {
          reject(err)
        }
        resolve((size / 1024 / 1024).toFixed(2) + ' MB')
      })
    })
  }

  async deleteBackup(filename) {
    const path = join(BackupsService.backupPath, filename)
    if (!existsSync(path)) {
      throw new UnprocessableEntityException('文件不存在')
    }
    execSync('rm -r ' + path)
    return 'OK'
  }

  checkBackupExist(dirname: string) {
    const path = join(
      BackupsService.backupPath,
      dirname,
      'backup-' + dirname + '.zip',
    )
    if (!existsSync(path)) {
      throw new UnprocessableEntityException('文件不存在')
    }
    return path
  }

  getFileStream(dirname: string) {
    const path = this.checkBackupExist(dirname)
    const stream = new Readable()

    stream.push(readFileSync(path))
    stream.push(null)

    return stream
  }

  async rollbackTo(dirname: string) {
    const bakFilePath = this.checkBackupExist(dirname) // zip file path
    const dirPath = join(BackupsService.backupPath, dirname)
    try {
      if (existsSync(join(join(dirPath, 'mx-space')))) {
        rmdirSync(join(dirPath, 'mx-space'), { recursive: true })
      }
      const cmd = `unzip ${bakFilePath}`
      execSync(cmd, { cwd: dirPath })
    } catch {
      return this.logger.error('服务端没有安装 unzip.')
    }
    try {
      if (!existsSync(join(dirPath, 'mx-space'))) {
        return this.logger.error('备份文件错误, 目录不存在')
      }
      const cmd = `mongorestore -h ${
        process.env.DB_URL || '127.0.0.1'
      } -d mx-space ./mx-space --drop  >/dev/null 2>&1`

      execSync(cmd, { cwd: dirPath })
    } catch (e) {
      this.logger.error(e.message)
    } finally {
      rmdirSync(join(dirPath, 'mx-space'), { recursive: true })
    }
    this.logger.log('数据恢复成功')
  }
}
