import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DocumentType } from '@typegoose/typegoose'
import PostModel from 'libs/db/src/models/post.model'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { CommentDto } from 'src/shared/comments/dto/comment.dto'
import { StateQueryDto } from 'src/shared/comments/dto/state.dto'
import { IdDto } from '../base/dto/id.dto'
import { CommentsService } from './comments.service'
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

  @Get('info')
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('bearer')
  @ApiOperation({ summary: '获取评论各类型的数量的接口' })
  async getCommentsInfo() {
    const passed = await this.commentService.countDocument({
      state: 1,
    })
    const gomi = await this.commentService.countDocument({ state: 2 })
    const needChecked = await this.commentService.countDocument({
      state: 0,
    })

    return {
      passed,
      gomi,
      needChecked,
    }
  }

  @Post(':id')
  @ApiOperation({ summary: '根据文章的 _id 评论' })
  async comment(@Param() params: IdDto, @Body() body: CommentDto) {
    const pid = params.id
    const model = { ...body }
    try {
      const comment = await this.commentService.createComment(pid, model)
      return comment
    } catch {
      throw new CannotFindException()
    }
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

  @Put(':id')
  @ApiOperation({ summary: '修改评论的状态' })
  @UseGuards(AuthGuard('jwt'))
  async modifyCommentState(
    @Param() params: IdDto,
    @Query() query: StateQueryDto,
  ) {
    const { id } = params
    const { state } = query

    try {
      const query = await this.commentService.updateAsync(
        {
          _id: id,
        },
        { state },
      )

      return query
    } catch {
      throw new CannotFindException()
    }
  }
}
