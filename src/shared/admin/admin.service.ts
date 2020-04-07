import { Option } from '@libs/db/models/option.model'
import { User } from '@libs/db/models/user.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}
}
