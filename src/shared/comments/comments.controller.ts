import { Controller, Get, Param, Body, Post } from '@nestjs/common'
import { ApiTags, ApiParam } from '@nestjs/swagger'
import { DocumentType } from '@typegoose/typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { IdDto } from '../base/dto/id.dto'
import { CommentsService } from './comments.service'
import { CommentDto } from 'src/shared/comments/dto/comment.dto'
import PostModel from 'libs/db/src/models/post.model'
@Controller('comments')
@ApiTags('Comment Routes')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}
  @Get('/post/:id')
  @ApiParam({
    name: 'id',
    description: 'pid',
    example: '5e6f67e85b303781d28072a3',
  })
  async getCommentsByPid(@Param() params: IdDto) {
    const { id } = params
    const comments = await this.commentService.findOne({
      hasParent: false,
      pid: id,
    })
    return comments
  }

  @Post('/reply/:id')
  @ApiParam({
    name: 'id',
    description: 'cid',
    example: '5e7370bec56432cbac578e2d',
  })
  async replyByCid(@Param() params: IdDto, @Body() body: CommentDto) {
    const { id } = params
    const parent = await this.commentService.findById(id).populate('pid')
    if (!parent) {
      throw new CannotFindException()
    }
    const commentIndex = parent.commentsIndex
    const key = `${parent.key}#${commentIndex + 1}`

    const model = {
      parent,
      pid: (parent.pid as DocumentType<PostModel>)._id,
      hasParent: true,
      ...body,
      key,
    }

    const res = await this.commentService.createNew(model)

    await parent.updateOne({
      $push: {
        children: res._id,
      },
      $inc: {
        commentsIndex: 1,
      },
    })

    return { data: res }
  }
}
