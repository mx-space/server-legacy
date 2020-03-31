import { Module } from '@nestjs/common'
import { TestController } from './test.controller'
import { TestService } from 'src/shared/test/test.service'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [GatewayModule],
})
export class TestModule {}
