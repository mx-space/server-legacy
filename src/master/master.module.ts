import { Module } from '@nestjs/common'
import MasterService from './master.service'
import { MasterController } from './master.controller'
import { LocalStrategy } from 'src/auth/local.strategy'
import { AuthModule } from 'src/auth/auth.module'
import { PassportModule } from '@nestjs/passport'

@Module({
  providers: [MasterService, LocalStrategy],
  imports: [AuthModule, PassportModule],
  controllers: [MasterController],
  exports: [MasterService],
})
export class MasterModule {}
