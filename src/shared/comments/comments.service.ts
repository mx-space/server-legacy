import Comment, {
  CommentRefTypes,
  CommentState,
} from '@libs/db/models/comment.model'
import Note from '@libs/db/models/note.model'
import Page from '@libs/db/models/page.model'
import Post from '@libs/db/models/post.model'
import { User } from '@libs/db/models/user.model'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { FilterQuery, Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { BaseService } from '../base/base.service'
import { ConfigsService } from '../../configs/configs.service'
import { Mailer, ReplyMailType } from '../../plugins/mailer'
import { DocumentType } from '@typegoose/typegoose'
import { SpamCheck } from '../../plugins/antiSpam'
@Injectable()
export class CommentsService extends BaseService<Comment> {
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
  ) {
    super(commentModel)
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

  async createComment(
    id: string,
    type: CommentRefTypes,
    doc: Partial<Comment>,
  ) {
    const commentOptions = this.configs.get('commentOptions')
    if (commentOptions.antiSpam) {
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
        throw new UnprocessableEntityException('此评论为垃圾评论已屏蔽')
      }
    }
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
      children.map(async (id: string) => {
        await this.deleteComments(id)
      })
    }
    if (parent) {
      const parent = await this.commentModel.findById(comment.parent)
      await parent.updateOne({
        $pull: {
          children: comment._id,
        },
      })
    }
    return { message: '删除成功' }
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
      },
    )

    return queryList
  }

  async sendEmail(
    model: DocumentType<Comment>,
    type: ReplyMailType,
    who?: string,
  ) {
    const mailerOptions = this.configs.get('mailOptions')
    this.userModel.findOne().then(async (master) => {
      // const ref = (await this.commentModel.findById(model._id).populate('ref')).ref
      const refType = model.refType
      const refModel = this.getModelByRefType(refType)
      const ref = await refModel.findById(model.ref).populate('category')
      const time = new Date(model.created)
      const parsedTime = `${time.getDate()}/${
        time.getMonth() + 1
      }/${time.getFullYear()}`
      new Mailer(
        mailerOptions.user,
        mailerOptions.pass,
        mailerOptions.options,
      ).send({
        to: type === ReplyMailType.Owner ? master.mail : model.mail,
        type,
        source: {
          title: ref.title,
          text: model.text,
          author: model.author,
          master: who || master.name,
          link: this.resolveUrlByType(refType, ref),
          time: parsedTime,
          mail: ReplyMailType.Owner ? model.mail : master.mail,
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
