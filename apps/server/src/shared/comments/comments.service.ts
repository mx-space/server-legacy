import Comment, { CommentRefTypes } from '@libs/db/models/comment.model'
import Note from '@libs/db/models/note.model'
import Page from '@libs/db/models/page.model'
import Post from '@libs/db/models/post.model'
import { User } from '@libs/db/models/user.model'
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { FilterQuery, Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'shared/core/exceptions/cant-find.exception'
import { ConfigsService } from '../../common/global/configs/configs.service'
import { AdminEventsGateway } from '../../gateway/admin/events.gateway'
import { SpamCheck } from '../../plugins/antiSpam'
import { Mailer, ReplyMailType } from '../../plugins/mailer'
import { hasChinese } from '../../../../../shared/utils'
import { BaseService } from '../base/base.service'
import { merge } from 'lodash'
// import BlockedKeywords from './block-keywords.json'
import BlockedKeywords = require('./block-keywords.json')
@Injectable()
export class CommentsService extends BaseService<Comment> {
  private readonly logger: Logger = new Logger(CommentsService.name)
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
    @InjectModel(Post)
    private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Note)
    private readonly noteModel: ReturnModelType<typeof Note>,
    @InjectModel(Page)
    private readonly pageModel: ReturnModelType<typeof Page>,
    @InjectModel(User)
    private readonly userModel: ReturnModelType<typeof User>,
    private readonly configs: ConfigsService,
    private readonly gateway: AdminEventsGateway,
  ) {
    super(commentModel)

    // this.commentModel.findOne().then((doc) => {
    //   console.log(doc)

    //   this.sendEmail(doc, ReplyMailType.Owner, true)
    // })
  }

  getModelByRefType(type: CommentRefTypes) {
    const map = new Map(
      Object.entries({
        Post: this.postModel,
        Note: this.noteModel,
        Page: this.pageModel,
      }),
    )
    return (map.get(type) as any) as ReturnModelType<
      typeof Note | typeof Post | typeof Page
    >
  }
  async checkSpam(doc: Partial<Comment>) {
    const res = await (async () => {
      const commentOptions = this.configs.get('commentOptions')
      if (!commentOptions.antiSpam) {
        return false
      }
      const master = await this.userModel.findOne().select('username')
      if (doc.author === master.username) {
        return false
      }
      if (commentOptions.blockIps) {
        const isBlock = commentOptions.blockIps.some((ip) =>
          new RegExp(ip, 'ig').test(doc.ip),
        )
        if (isBlock) {
          return true
        }
      }

      {
        const customKeywords = commentOptions.spamKeywords || []
        const isBlock = [
          ...customKeywords,
          ...BlockedKeywords,
        ].some((keyword) => new RegExp(keyword, 'ig').test(doc.text))

        if (isBlock) {
          return true
        }
      }

      if (!hasChinese(doc.text)) {
        return true
      }
      if (!commentOptions.akismetApiKey) {
        this.logger.warn('--> 反垃圾评论 api 填写错误')
        return false
      }
      try {
        const client = new SpamCheck({
          apiKey: commentOptions.akismetApiKey,
          blog: this.configs.get('url').webUrl,
        })
        const isSpam = await client.isSpam({
          ip: doc.ip,
          author: doc.author,
          content: doc.text,
          url: doc.url,
        })
        if (isSpam) {
          return true
        }
        return false
      } catch {
        return false
      }
    })()
    if (res) {
      this.logger.warn(
        '--> 检测到一条垃圾评论: ' + `author: ${doc.author} IP: ${doc.ip}`,
      )
    }
    return res
  }
  async createComment(
    id: string,
    type: CommentRefTypes,
    doc: Partial<Comment>,
  ) {
    const model = this.getModelByRefType(type)
    const ref = await model.findById(id)
    if (!ref) {
      throw new CannotFindException()
    }
    const commentIndex = ref.commentsIndex
    doc.key = `#${commentIndex + 1}`
    const comment = await this.createNew({
      ...doc,
      ref: Types.ObjectId(id),
      refType: type,
    })
    await ref.updateOne({
      $inc: {
        commentsIndex: 1,
      },
    } as FilterQuery<Post>)

    return comment
  }

  async ValidAuthorName(author: string): Promise<void> {
    const isExist = await this.userModel.findOne({
      name: author,
    })
    if (isExist) {
      throw new UnprocessableEntityException(
        '用户名与主人重名啦, 但是你好像并不是我的主人唉',
      )
    }
  }

  async deleteComments(id: string) {
    const comment = await this.commentModel.findOneAndDelete({ _id: id })
    if (!comment) {
      throw new CannotFindException()
    }
    const { children, parent } = comment
    if (children && children.length > 0) {
      await Promise.all(
        children.map(async (id) => {
          await this.deleteComments((id as any) as string)
        }),
      )
    }
    if (parent) {
      const parent = await this.commentModel.findById(comment.parent)
      if (parent) {
        await parent.updateOne({
          $pull: {
            children: comment._id,
          },
        })
      }
    }
    return { message: '删除成功' }
  }

  async allowComment(id: string, type: CommentRefTypes) {
    const model = this.getModelByRefType(type)
    const doc = await model.findById(id)
    return doc.allowComment ?? true
  }

  async getComments({ page, size, state } = { page: 1, size: 10, state: 0 }) {
    const skip = size * (page - 1)

    const queryList = await this.findWithPaginator(
      { state },
      {
        select: '+ip +agent -children',
        skip,
        limit: size,
        populate: [
          { path: 'parent', select: '-children' },
          { path: 'ref', select: 'title _id slug' },
        ],
        sort: { created: -1 },
      },
    )

    return queryList
  }

  async sendEmail(
    model: DocumentType<Comment>,
    type: ReplyMailType,
    debug?: true,
  ) {
    const enable = this.configs.get('mailOptions').enable
    if (!enable || (process.env.NODE_ENV === 'development' && !debug)) {
      return
    }
    const mailerOptions = merge(
      {
        options: {
          name: this.configs.get('seo').title,
        },
      },
      {
        ...this.configs.get('mailOptions'),
      },
    )
    this.userModel.findOne().then(async (master) => {
      const refType = model.refType
      const refModel = this.getModelByRefType(refType)
      const ref = await refModel.findById(model.ref).populate('category')
      const time = new Date(model.created)
      const parent = await this.commentModel.findOne({ _id: model.parent })

      const parsedTime = `${time.getDate()}/${
        time.getMonth() + 1
      }/${time.getFullYear()}`
      new Mailer(
        mailerOptions.user,
        mailerOptions.pass,
        mailerOptions.options,
      ).sendCommentNotificationMail({
        to: type === ReplyMailType.Owner ? master.mail : parent.mail,
        type,
        source: {
          title: ref.title,
          text: model.text,
          author: type === ReplyMailType.Guest ? parent.author : model.author,
          master: master.name,
          link: this.resolveUrlByType(refType, ref),
          time: parsedTime,
          mail: ReplyMailType.Owner === type ? model.mail : master.mail,
          ip: model.ip || '',
        },
      })
    })
  }

  resolveUrlByType(type: CommentRefTypes, model: any) {
    const base = this.configs.get('url').webUrl
    switch (type) {
      case CommentRefTypes.Note: {
        return new URL('/notes/' + model.nid, base).toString()
      }
      case CommentRefTypes.Page: {
        return new URL(`/${model.slug}`, base).toString()
      }
      case CommentRefTypes.Post: {
        return new URL(`/${model.category.slug}/${model.slug}`, base).toString()
      }
    }
  }
}
