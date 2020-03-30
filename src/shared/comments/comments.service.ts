import Comment from '@libs/db/models/comment.model'
import Post from '@libs/db/models/post.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types, FilterQuery } from 'mongoose'
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
  ) {
    super(commentModel)
  }

  async createComment(pid: string, model: Partial<Comment>) {
    const post = await this.postModel.findById(pid)
    const commentIndex = post.commentsIndex
    model.key = `#${commentIndex + 1}`
    if (!post) {
      throw new CannotFindException()
    }
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
}
