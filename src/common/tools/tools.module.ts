import { Global, Module } from '@nestjs/common'
import { ToolsService } from './tools.service'

@Global()
@Module({
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
