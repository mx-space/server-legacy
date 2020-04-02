import { Controller, Get } from '@nestjs/common'
import { TestService } from './test.service'
import { ApiTags } from '@nestjs/swagger'
@Controller('test')
@ApiTags('Test Api')
export class TestController {
  constructor(private readonly testSerive: TestService) {}

  @Get()
  testWs() {
    this.testSerive.sendMessage()
    return {}
  }
}
