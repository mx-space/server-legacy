/*
 * @Author: Innei
 * @Date: 2020-08-24 21:34:13
 * @LastEditTime: 2020-09-09 13:38:19
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/common/global/tools/tools.module.ts
 * @Mark: Coding with Love
 */
import { Module } from '@nestjs/common'
import { ToolsService } from './tools.service'

@Module({
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
