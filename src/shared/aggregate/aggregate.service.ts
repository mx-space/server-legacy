import Category from '@libs/db/models/category.model'
import Comment from '@libs/db/models/comment.model'
import { FileType } from '@libs/db/models/file.model'
import Note from '@libs/db/models/note.model'
import Page from '@libs/db/models/page.model'
import Post from '@libs/db/models/post.model'
import { Project } from '@libs/db/models/project.model'
import { Say } from '@libs/db/models/say.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { sample, sampleSize } from 'lodash'
import { InjectModel } from 'nestjs-typegoose'
import { ImageService } from '../uploads/image.service'
import { RandomType } from './dtos/random.dto'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { DocumentQuery } from 'mongoose'
import { DocumentType } from '@typegoose/typegoose'
import { pick } from 'lodash'
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
    private readonly imageService: ImageService,
  ) {}

  private findTop<
    U extends AnyParamConstructor<any>,
    T extends ReturnModelType<U>
  >(
    model: T,
    condition = {},
    size = 6,
  ): DocumentQuery<DocumentType<T>[], DocumentType<T>, {}> {
    return model
      .find(condition)
      .sort({ created: -1 })
      .limit(size)
      .select('_id title name slug avatar nid')
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
    ).lean()

    const _posts = (await this.findTop(
      this.postModel,
      isMaster ? { hide: false } : {},
      size,
    )
      .populate('categoryId')
      .lean()) as any[]

    const posts = _posts.map((post) => {
      post.category = pick(post.categoryId, ['name', 'slug'])
      delete post.categoryId
      return post
    })

    const projects = await this.projectModel
      .find()
      .sort({ create: -1 })
      .limit(size)
      .select('avatar _id name')

    const says = await this.sayModel.find({}).sort({ create: -1 }).limit(size)

    return { notes, posts, projects, says }
  }

  async getAllCategory() {
    return await this.categoryModel.find().lean()
  }

  async getAllPages(select: string) {
    return await this.pageModel.find().select(select).sort({ order: -1 }).lean()
  }

  async getRandomContent(type: RandomType, imageType: FileType, size: number) {
    switch (type) {
      case RandomType.NOTE:
        return sample(
          await this.noteModel
            .find({ hide: false, password: undefined })
            .limit(10),
        )
      case RandomType.POST:
        return sample(
          await this.postModel
            .find({ hide: false })
            .populate('category')
            .limit(10),
        )
      case RandomType.SAY:
        return sampleSize(await this.sayModel.find(), size)
      case RandomType.IMAGE:
        return await this.imageService.getRandomImages(size, imageType)
    }
  }
}
