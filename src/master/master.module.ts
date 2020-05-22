import { Global, Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { MasterController } from './master.controller'
import MasterService from './master.service'

@Global()
@Module({
  imports: [AuthModule],
  providers: [MasterService],
  controllers: [MasterController],
  exports: [MasterService],
})
export class MasterModule {}
