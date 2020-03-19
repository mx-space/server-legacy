import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { DbModule } from '@libs/db'
import { MasterController } from './master/master.controller'
import { MasterModule } from './master/master.module'

@Module({
  imports: [DbModule, MasterModule],
  controllers: [MasterController],
  providers: [AppService],
})
export class AppModule {}
