import { Controller, Get, HttpService } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { map } from 'rxjs/operators'
import { TestService } from './test.service'
@Controller('test')
@ApiTags('Test Api')
export class TestController {
  constructor(
    private readonly testService: TestService,
    private readonly httpService: HttpService,
  ) {}

  @Get('ws')
  testWs() {
    this.testService.sendMessage()
    return {}
  }
  @Get('http')
  async testHttp() {
    return this.httpService
      .get('http://baidu.com')
      .pipe(map((data) => data.data))
  }
}
