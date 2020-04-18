import { Say } from '@libs/db/models/say.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from 'src/shared/base/base.service'

@Injectable()
export class SaysService extends BaseService<Say> {
  constructor(
    @InjectModel(Say)
    private readonly Model: ReturnModelType<typeof Say>,
  ) {
    super(Model)
  }
}
