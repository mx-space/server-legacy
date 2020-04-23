import { Module, Global } from '@nestjs/common'
import { ConfigsService } from './configs.service'

@Global()
@Module({
  providers: [ConfigsService],
})
export class ConfigsModule {}
