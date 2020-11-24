/*
 * @Author: Innei
 * @Date: 2020-10-03 10:14:56
 * @LastEditTime: 2020-10-03 10:59:37
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/aggregate/aggregate.service.ts
 * @Mark: Coding with Love
 */
import Category from '@libs/db/models/category.model'
import Comment from '@libs/db/models/comment.model'
import Note from '@libs/db/models/note.model'
import Page from '@libs/db/models/page.model'
import Post from '@libs/db/models/post.model'
import { Project } from '@libs/db/models/project.model'
import { Say } from '@libs/db/models/say.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { ConfigsService, ToolsService } from 'apps/server/src/common/global'
import { pick } from 'lodash'
import { InjectModel } from 'nestjs-typegoose'

@Injectable()
export class AggregateService {
  constructor(
    @InjectModel(Post) public readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Note) public readonly noteModel: ReturnModelType<typeof Note>,
    @InjectModel(Comment)
    public readonly commentModel: ReturnModelType<typeof Comment>,
    @InjectModel(Say) public readonly sayModel: ReturnModelType<typeof Say>,
    @InjectModel(Project)
    public readonly projectModel: ReturnModelType<typeof Project>,
    @InjectModel(Category)
    public readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Page) public readonly pageModel: ReturnModelType<typeof Page>,

    private readonly configs: ConfigsService,
    public readonly tools: ToolsService,
  ) {}

  private findTop<
    U extends AnyParamConstructor<any>,
    T extends ReturnModelType<U>
  >(model: T, condition = {}, size = 6) {
    return model.find(condition).sort({ created: -1 }).limit(size)
  }

  async topActivity(size = 6, isMaster = false) {
    const notes = await this.findTop(
      this.noteModel,
      !isMaster
        ? {
            hide: false,
            password: undefined,
          }
        : {},
      size,
    ).lean()

    const _posts = (await this.findTop(
      this.postModel,
      !isMaster ? { hide: false } : {},
      size,
    )
      .populate('categoryId')
      .lean()) as any[]

    const posts = _posts.map((post) => {
      post.category = pick(post.categoryId, ['name', 'slug'])
      return post
    })

    const projects = await this.projectModel
      .find()
      .sort({ create: -1 })
      .limit(size)

    const says = await this.sayModel.find({}).sort({ create: -1 }).limit(size)

    return { notes, posts, projects, says }
  }
}
