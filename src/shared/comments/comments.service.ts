import Comment from '@libs/db/models/comment.model'
import Post from '@libs/db/models/post.model'
import {
  Injectable,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types, FilterQuery, QueryCursor } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { BaseService } from '../base/base.service'
import { User } from '@libs/db/models/user.model'
import { Cursor } from 'mongodb'
@Injectable()
export class CommentsService extends BaseService<Comment> {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
    @InjectModel(Post)
    private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(User)
    private readonly userModel: ReturnModelType<typeof User>,
  ) {
    super(commentModel)
  }

  async createComment(pid: string, model: Partial<Comment>) {
    const post = await this.postModel.findById(pid)
    if (!post) {
      throw new CannotFindException()
    }
    const commentIndex = post.commentsIndex
    model.key = `#${commentIndex + 1}`
    const comment = await this.createNew({
      ...model,
      pid: Types.ObjectId(pid),
    })
    await post.updateOne({
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
    const cursor = (this.commentModel.collection
      .find({ state })
      .sort({ created: -1 })
      .skip(skip)
      .limit(size) as any) as Cursor
    const queryList = await cursor.toArray()
    if (queryList.length === 0) {
      if (page === 1) {
        throw new UnprocessableEntityException('暂没有评论呢')
      } else throw new BadRequestException('没有下页啦!')
    }
    const count = await this.countDocument({ state })
    const totalPage = Math.ceil(count / size)
    return {
      data: queryList,
      page: {
        total: count,
        size: queryList.length,
        currentPage: page,
        totalPage,
        hasPrevPage: page !== 1,
        hasNextPage: page < totalPage,
      },
    }
  }
}
