import { Option } from '@libs/db/models/option.model'
import { User } from '@libs/db/models/user.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import Post from '@libs/db/models/post.model'
import Note from '@libs/db/models/note.model'
@Injectable()
export class OptionsService {
  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Note) private readonly nodeModel: ReturnModelType<typeof Note>,
  ) {}

  async getStat() {
    const posts = await this.postModel.countDocuments()
    const notes = await this.nodeModel.countDocuments()

    return { posts, notes }
  }
}
