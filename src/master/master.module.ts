import { Module, Global } from '@nestjs/common'
import { MasterController } from './master.controller'
import MasterService from './master.service'
import { AuthModule } from 'src/auth/auth.module'

@Global()
@Module({
  imports: [AuthModule],
  providers: [MasterService],
  controllers: [MasterController],
  exports: [MasterService],
})
export class MasterModule {}
