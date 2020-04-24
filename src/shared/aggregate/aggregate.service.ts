import Comment from '@libs/db/models/comment.model'
import Note from '@libs/db/models/note.model'
import Post from '@libs/db/models/post.model'
import { Project } from '@libs/db/models/project.model'
import { Say } from '@libs/db/models/say.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import Category from '@libs/db/models/category.model'
import Page from '@libs/db/models/page.model'
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
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Page) private readonly pageModel: ReturnModelType<typeof Page>,
  ) {}

  private async findTop(model: any, condition = {}, size = 6) {
    return await model
      .find(condition)
      .sort({ created: -1 })
      .limit(size)
      .select('_id title name slug category avatar nid')
      .lean()
  }

  async topActivity(size = 6, isMaster = false) {
    const notes = await this.findTop(
      this.noteModel,
      isMaster
        ? {
            hide: false,
            password: undefined,
          }
        : {},
      size,
    )
    const posts = await this.findTop(
      this.postModel,
      isMaster ? { hide: false } : {},
      size,
    )
    const projects = await this.findTop(this.projectModel, {}, size)
    const says = await this.findTop(this.sayModel, {}, size)

    return { notes, posts, projects, says }
  }

  async getAllCategory() {
    return await this.categoryModel.find().lean()
  }

  async getAllPages(select: string) {
    return await this.pageModel.find().select(select).sort({ order: -1 }).lean()
  }
}
