import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { Option } from '@libs/db/models/option.model'

@Injectable()
export class ConfigsService {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
  ) {}
}
