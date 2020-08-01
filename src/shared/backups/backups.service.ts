/*
 * @Author: Innei
 * @Date: 2020-05-14 11:46:26
 * @LastEditTime: 2020-07-31 22:06:21
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/backups/backups.service.ts
 * @Coding with Love
 */

import {
  Injectable,
  Logger,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common'
import { execSync } from 'child_process'
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from 'fs'
import * as mkdirp from 'mkdirp'
import { homedir } from 'os'
import { join, resolve } from 'path'
import { Readable } from 'stream'
import { AdminEventsGateway } from '../../gateway/admin/events.gateway'
import { EventTypes, NotificationTypes } from '../../gateway/events.types'
import getFolderSize = require('get-folder-size')

@Injectable({ scope: Scope.REQUEST })
export class BackupsService {
  private logger: Logger = new Logger(BackupsService.name)
  constructor(private readonly adminGateway: AdminEventsGateway) {}
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
      if (!statSync(path).isDirectory()) {
        continue
      }
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

  saveTempBackupByUpload(buffer: Buffer) {
    const tempDirPath = '/tmp/mx-space/backup'
    const tempBackupPath = join(tempDirPath, 'backup.zip')
    mkdirp.sync(tempDirPath)
    writeFileSync(tempBackupPath, buffer)

    try {
      const cmd = `unzip backup.zip;
        mongorestore -h ${
          process.env.DB_URL || '127.0.0.1'
        } -d mx-space ./mx-space --drop  >/dev/null 2>&1
      `

      execSync(cmd, {
        cwd: tempDirPath,
      })
      this.logger.debug('恢复成功')
      this.adminGateway.broadcase(EventTypes.CONTENT_REFRESH, 'restore_done')
    } catch (e) {
      const logDir = '/tmp/mx-space/log'
      mkdirp.sync(logDir)
      writeFileSync(logDir, e, { encoding: 'utf-8', flag: 'a+' })
    } finally {
      rmdirSync(tempDirPath, { recursive: true })
    }
  }
  async rollbackTo(dirname: string, id: string) {
    const sendToSocket = (message: string, type: NotificationTypes = 'error') =>
      this.adminGateway.sendNotification({
        payload: { type, message },
        id,
      })

    const bakFilePath = this.checkBackupExist(dirname) // zip file path
    const dirPath = join(BackupsService.backupPath, dirname)
    try {
      if (existsSync(join(join(dirPath, 'mx-space')))) {
        rmdirSync(join(dirPath, 'mx-space'), { recursive: true })
      }
      const cmd = `unzip ${bakFilePath}`
      execSync(cmd, { cwd: dirPath })
    } catch {
      sendToSocket('服务端 unzip 命令未找到')
      return
    }
    try {
      if (!existsSync(join(dirPath, 'mx-space'))) {
        return sendToSocket('备份文件错误, 目录不存在')
      }
      const cmd = `mongorestore -h ${
        process.env.DB_URL || '127.0.0.1'
      } -d mx-space ./mx-space --drop  >/dev/null 2>&1`

      execSync(cmd, { cwd: dirPath })
    } catch (e) {
      return sendToSocket(e.message)
    } finally {
      try {
        rmdirSync(join(dirPath, 'mx-space'), { recursive: true })
      } catch {}
    }
    sendToSocket('数据恢复成功', 'success')
    this.adminGateway.broadcase(EventTypes.CONTENT_REFRESH, 'restore_done')
  }
}
