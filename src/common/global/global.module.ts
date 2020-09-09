/*
 * @Author: Innei
 * @Date: 2020-09-09 13:37:11
 * @LastEditTime: 2020-09-09 13:38:06
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/common/global/global.module.ts
 * @Mark: Coding with Love
 */
import { Global, Module } from '@nestjs/common'
import { ConfigsModule } from './configs/configs.module'
import { ToolsModule } from './tools/tools.module'

@Global()
@Module({
  imports: [ToolsModule, ConfigsModule],
  exports: [ToolsModule, ConfigsModule],
})
export class GlobalModule {}
