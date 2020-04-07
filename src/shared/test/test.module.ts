import { HttpModule, Module } from '@nestjs/common'
import { GatewayModule } from 'src/gateway/gateway.module'
import { TestService } from 'src/shared/test/test.service'
import { TestController } from './test.controller'

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [GatewayModule, HttpModule],
})
export class TestModule {}
