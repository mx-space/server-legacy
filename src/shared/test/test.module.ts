import { Module, HttpModule } from '@nestjs/common'
import { TestController } from './test.controller'
import { TestService } from 'src/shared/test/test.service'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [GatewayModule, HttpModule],
})
export class TestModule {}
