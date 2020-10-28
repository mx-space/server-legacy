/*
 * @Author: Innei
 * @Date: 2020-08-01 19:49:31
 * @LastEditTime: 2020-08-01 19:54:29
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/constants/index.ts
 * @Coding with Love
 */
import { homedir } from 'os'
import { join } from 'path'
import { isDev } from 'src/utils'

export const HOME = homedir()

export const TEMP_DIR = isDev ? join(__dirname, '../tmp') : '/tmp/mx-space'

export const DATA_DIR = isDev
  ? join(__dirname, '../tmp')
  : join(HOME, '.mx-space')
