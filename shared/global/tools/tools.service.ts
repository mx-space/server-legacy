/*
 * @Author: Innei
 * @Date: 2020-08-24 21:35:20
 * @LastEditTime: 2021-01-15 14:32:35
 * @LastEditors: Innei
 * @FilePath: /server/shared/global/tools/tools.service.ts
 * @Coding with Love
 */
import Category, { CategoryType } from '@libs/db/models/category.model'
import Note from '@libs/db/models/note.model'
import Page from '@libs/db/models/page.model'
import Post from '@libs/db/models/post.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { ConfigsService } from 'shared/global/configs/configs.service'
import { addConditionToSeeHideContent } from 'shared/utils'

@Injectable()
export class ToolsService {
  constructor(
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Note) private readonly noteModel: ReturnModelType<typeof Note>,
    @InjectModel(Page) private readonly pageModel: ReturnModelType<typeof Page>,
    @InjectModel(Category)
    public readonly categoryModel: ReturnModelType<typeof Category>,

    private readonly configs: ConfigsService,
  ) {}

  async getSiteMapContent() {
    const baseURL = this.configs.get('url').webUrl
    const posts = (await this.postModel.find().populate('category')).map(
      (doc) => {
        return {
          url: new URL(
            `/posts/${(doc.category as Category).slug}/${doc.slug}`,
            baseURL,
          ),
          published_at: doc.modified,
        }
      },
    )
    const notes = (await this.noteModel.find().lean()).map((doc) => {
      return {
        url: new URL(`/notes/${doc.nid}`, baseURL),
        published_at: doc.modified,
      }
    })

    const pages = (await this.pageModel.find().lean()).map((doc) => {
      return {
        url: new URL(`/${doc.slug}`, baseURL),
        published_at: doc.modified,
      }
    })

    return [...pages, ...notes, ...posts].sort(
      (a, b) => -(a.published_at.getTime() - b.published_at.getTime()),
    )
  }

  async getLastestNoteNid(showHide?: boolean) {
    return (
      await this.noteModel
        .findOne(addConditionToSeeHideContent(showHide))
        .sort({ nid: -1 })
        .lean()
        .select('nid')
    ).nid
  }

  async getAllCategory() {
    return await this.categoryModel.find({ type: CategoryType.Category }).lean()
  }

  async getAllPages(select: string) {
    return await this.pageModel.find().select(select).sort({ order: -1 }).lean()
  }

  async getCounts() {
    const posts = await this.postModel.countDocuments()
    const notes = await this.noteModel.countDocuments()

    return { posts, notes }
  }
}
