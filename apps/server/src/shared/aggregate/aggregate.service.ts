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
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { ToolsService } from 'shared/global/tools/tools.service'
import { pick, sample, sampleSize } from 'lodash'
import { InjectModel } from 'nestjs-typegoose'
import { ConfigsService } from '../../../../../shared/global/configs/configs.service'
import { ImageService } from '../uploads/image.service'
import { RandomType } from './dtos/random.dto'
import dayjs = require('dayjs')
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
    public readonly imageService: ImageService,
    private readonly configs: ConfigsService,
    private readonly tools: ToolsService,
  ) {}

  private findTop<
    U extends AnyParamConstructor<any>,
    T extends ReturnModelType<U>
  >(model: T, condition = {}, size = 6) {
    return model
      .find(condition)
      .sort({ created: -1 })
      .limit(size)
      .select('_id title name slug avatar nid')
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

  get getAllCategory() {
    return this.tools.getAllCategory
  }

  get getAllPages() {
    return this.tools.getAllPages
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

  async getSiteMapContent() {
    return { data: await this.tools.getSiteMapContent() }
  }
  get getLastestNoteNid() {
    return this.tools.getLastestNoteNid
  }
  async buildRssStructure(): Promise<RSSProps> {
    const data = await this.getRSSFeedContent()
    const title = this.configs.get('seo').title
    const author = (await this.configs.getMaster()).name
    const url = this.configs.get('url').webUrl
    return {
      title,
      author,
      url,
      data,
    }
  }
  async getRSSFeedContent() {
    const baseURL = this.configs.get('url').webUrl
    const posts = await this.postModel
      .find({ hide: false })
      .limit(10)
      .sort({ created: -1 })
      .populate('category')
    const notes = await this.noteModel
      .find({
        hide: false,
        password: undefined,
      })
      .limit(10)
      .sort({ created: -1 })
    const postsRss: RSSProps['data'] = posts.map((post) => {
      return {
        title: post.title,
        text: post.text,
        created: post.created,
        modified: post.modified,
        link: new URL(
          '/posts' + `/${(post.category as Category).slug}/${post.slug}`,
          baseURL,
        ).toString(),
      }
    })
    const notesRss: RSSProps['data'] = notes.map((note) => {
      const isSecret = note.secret
        ? dayjs(note.secret).isAfter(new Date())
        : false
      return {
        title: note.title,
        text: isSecret ? '这篇文章暂时没有公开呢' : note.text,
        created: note.created,
        modified: note.modified,
        link: new URL('/notes/' + note.nid, baseURL).toString(),
      }
    })
    return postsRss
      .concat(notesRss)
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, 10)
  }
}
export interface RSSProps {
  title: string
  url: string
  author: string
  data: {
    created: Date
    modified: Date
    link: string
    title: string
    text: string
  }[]
}
