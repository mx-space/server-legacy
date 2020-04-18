import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import Post from '@libs/db/models/post.model'
import { InjectModel } from 'nestjs-typegoose'
import Note from '@libs/db/models/note.model'
import { Say } from '@libs/db/models/say.model'
import { Project } from '@libs/db/models/project.model'
import Comment from '@libs/db/models/comment.model'
@Injectable()
export class AggregateService {
  constructor(
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Note) private readonly noteModel: ReturnModelType<typeof Note>,
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
    @InjectModel(Say) private readonly sayModel: ReturnModelType<typeof Say>,
    @InjectModel(Project)
    private readonly projectModel: ReturnModelType<typeof Project>,
  ) {}

  private async findTop(model: any, condition = {}, size = 6) {
    return await model
      .find(condition)
      .sort({ created: -1 })
      .limit(size)
      .select('-text')
  }

  async topActivity(size = 6) {
    const notes = await this.findTop(
      this.noteModel,
      {
        hide: false,
        password: undefined,
      },
      size,
    )
    const posts = await this.findTop(this.postModel, { hide: false }, size)
    const projects = await this.projectModel
      .find()
      .sort({ created: -1 })
      .limit(size)
    const says = await this.findTop(this.sayModel, {}, size)

    return { notes, posts, projects, says }
  }
}
