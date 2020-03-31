import { Controller, Get } from '@nestjs/common'
import { TestService } from './test.service'
@Controller('test')
export class TestController {
  constructor(private readonly testSerive: TestService) {}

  @Get()
  testWs() {
    this.testSerive.sendMessage()
    return {}
  }
}
