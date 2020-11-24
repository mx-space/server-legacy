/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-10-21 18:55:04
 * @LastEditors: Innei
 * @FilePath: /server/src/master/master.module.ts
 * @Copyright
 */

import { Global, Module } from '@nestjs/common'
import { AuthModule } from 'apps/server/src/auth/auth.module'
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
export class MasterModule {
  constructor(private service: MasterService) {
    service.hasMaster().then((res) => {
      if (!res) {
        service
          .createMaster({
            name: 'master',
            username: 'master',
            password: 'master',
          })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch((e) => {})
      }
    })
  }
}
