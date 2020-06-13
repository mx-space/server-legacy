/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-23 20:45:51
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/master/master.module.ts
 * @Copyright
 */

import { Global, Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { MasterController } from './master.controller'
import MasterService from './master.service'
import { RedisModule } from 'nestjs-redis'

@Global()
@Module({
  imports: [AuthModule, RedisModule],
  providers: [MasterService],
  controllers: [MasterController],
  exports: [MasterService],
})
export class MasterModule {}
