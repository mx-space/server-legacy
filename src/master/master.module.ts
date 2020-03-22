import { Module } from '@nestjs/common'
import { MasterController } from './master.controller'
import MasterService from './master.service'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [AuthModule],
  providers: [MasterService],
  controllers: [MasterController],
  exports: [MasterService],
})
export class MasterModule {}
