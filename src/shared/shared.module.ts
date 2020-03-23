import { Module } from '@nestjs/common'
import { SharedService } from './shared.service'
import { BaseService } from './base/base.service'

@Module({
  providers: [SharedService],
})
export class SharedModule {}
