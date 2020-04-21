import Comment, { CommentRefTypes } from '@libs/db/models/comment.model'
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
  ) {
    super(commentModel)
  }

  getModelByRefType(type: CommentRefTypes) {
    const map = new Map(
      Object.entries({
        Post: this.postModel,
        Note: this.noteModel,
        page: this.pageModel,
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
    return { msg: '删除成功' }
  }

  async getRecently({ page, size, state } = { page: 1, size: 10, state: 0 }) {
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
}
