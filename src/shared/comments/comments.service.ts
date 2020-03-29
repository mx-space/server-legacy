import { Injectable } from '@nestjs/common'
import { BaseService } from '../base/base.service'
import Comment from '@libs/db/models/comment.model'
import { InjectModel } from 'nestjs-typegoose'
import { ReturnModelType } from '@typegoose/typegoose'

@Injectable()
export class CommentsService extends BaseService<Comment> {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
  ) {
    super(commentModel)
  }
}
