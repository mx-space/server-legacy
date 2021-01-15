/*
 * @Author: Innei
 * @Date: 2020-09-09 13:37:11
 * @LastEditTime: 2020-09-09 13:38:06
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/common/global/global.module.ts
 * @Mark: Coding with Love
 */
import { Global, HttpModule, Module } from '@nestjs/common'
import { ConfigsModule } from './configs/configs.module'
import { ToolsModule } from './tools/tools.module'

const Http = HttpModule.register({
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  },
})
@Global()
@Module({
  imports: [ToolsModule, ConfigsModule, Http],
  exports: [ToolsModule, ConfigsModule, Http],
})
export class GlobalModule {}
