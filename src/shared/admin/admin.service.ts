import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ReturnModelType } from '@typegoose/typegoose'
import { User } from '@libs/db/models/user.model'
import { Option } from '@libs/db/models/option.model'
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}
}
