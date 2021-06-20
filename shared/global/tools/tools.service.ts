/*
 * @Author: Innei
 * @Date: 2020-08-24 21:35:20
 * @LastEditTime: 2021-03-12 10:05:29
 * @LastEditors: Innei
 * @FilePath: /server/shared/global/tools/tools.service.ts
 * @Coding with Love
 */
import Category, { CategoryType } from '@libs/db/models/category.model'
import Comment, { CommentState } from '@libs/db/models/comment.model'
import { Link, LinkState } from '@libs/db/models/link.model'
import Note from '@libs/db/models/note.model'
import Page from '@libs/db/models/page.model'
import Post from '@libs/db/models/post.model'
import { Say } from '@libs/db/models/say.model'
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
    @InjectModel(Say) private readonly sayModel: ReturnModelType<typeof Say>,
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,

    @InjectModel(Category)
    public readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Link)
    public readonly linkModel: ReturnModelType<typeof Link>,

    private readonly configs: ConfigsService,
  ) {}

  async getSiteMapContent() {
    const baseURL = this.configs.get('url').webUrl
    const posts = (
      await this.postModel
        .find({
          hide: false,
        })
        .populate('category')
    ).map((doc) => {
      return {
        url: new URL(
          `/posts/${(doc.category as Category).slug}/${doc.slug}`,
          baseURL,
        ),
        published_at: doc.modified,
      }
    })
    const notes = (
      await this.noteModel
        .find({
          hide: false,
          secret: {
            $lte: new Date(),
          },
        })
        .lean()
    ).map((doc) => {
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
    const pages = await this.categoryModel.countDocuments()
    const says = await this.sayModel.countDocuments()
    const comments = await this.commentModel.countDocuments({
      parent: null,
      $or: [{ state: CommentState.Read }, { state: CommentState.Unread }],
    })
    const allComments = await this.commentModel.countDocuments({
      $or: [{ state: CommentState.Read }, { state: CommentState.Unread }],
    })
    const unreadComments = await this.commentModel.countDocuments({
      state: CommentState.Unread,
    })
    const links = await this.linkModel.countDocuments({ state: LinkState.Pass })
    const linkApply = await this.linkModel.countDocuments({
      state: LinkState.Audit,
    })
    const categories = await this.categoryModel.countDocuments({})
    return {
      allComments,
      categories,
      comments,
      linkApply,
      links,
      notes,
      pages,
      posts,
      says,
      unreadComments,
    }
  }
}
