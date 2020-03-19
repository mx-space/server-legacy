import { Controller, Get } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { User } from '@libs/db/models/user.model'

@Controller('master')
export class MasterController {
  constructor(@InjectModel(User) private readonly model) {}
  @Get()
  hello() {
    return 'hello'
  }
}
