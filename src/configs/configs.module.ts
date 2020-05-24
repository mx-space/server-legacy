/*
 * @Author: Innei
 * @Date: 2020-05-08 17:02:08
 * @LastEditTime: 2020-05-23 20:45:34
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/configs/configs.module.ts
 * @Copyright
 */

import { Global, Module } from '@nestjs/common'
import { ConfigsService } from './configs.service'

@Global()
@Module({
  providers: [ConfigsService],
  exports: [ConfigsService],
})
export class ConfigsModule {}
