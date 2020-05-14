import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { execSync } from 'child_process'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { join, resolve } from 'path'
import { Readable } from 'stream'
import getFolderSize = require('get-folder-size')
@Injectable()
export class BackupsService {
  public static backupPath = join(homedir(), '.mx-space/backup/')

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

  getFileStream(dirname) {
    const path = join(
      BackupsService.backupPath,
      dirname,
      'backup-' + dirname + '.zip',
    )
    if (!existsSync(path)) {
      throw new UnprocessableEntityException('文件不存在')
    }
    const stream = new Readable()

    stream.push(readFileSync(path))
    stream.push(null)

    return stream
  }
}
