import Comment from '@libs/db/models/comment.model'
import Post from '@libs/db/models/post.model'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types, FilterQuery } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { BaseService } from '../base/base.service'
import { User } from '@libs/db/models/user.model'

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
      username: author,
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
    const { children } = comment
    if (children && children.length > 0) {
      children.map(async (id: string) => {
        await this.deleteComments(id)
      })
    }
    return comment
  }
}
