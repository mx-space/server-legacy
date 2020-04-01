import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DocumentType } from '@typegoose/typegoose'
import PostModel from 'libs/db/src/models/post.model'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { IpLocation, IpRecord } from 'src/core/decorators/ip.decorator'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { CommentDto, TextOnlyDto } from 'src/shared/comments/dto/comment.dto'
import { StateQueryDto } from 'src/shared/comments/dto/state.dto'
import { IdDto } from '../base/dto/id.dto'
import { CommentsService } from './comments.service'
@Controller('comments')
@ApiTags('Comment Routes')
@UseGuards(RolesGuard)
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  // TODO show comment agent and ip for admin 2020-04-01 //
  @Get(':id')
  async getComments(@Param() params: IdDto) {
    const { id } = params
    return await this.commentService.findWithPaginator({
      _id: id,
    })
  }

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
  async comment(
    @Param() params: IdDto,
    @Body() body: CommentDto,
    @Body('author') author: string,
    @Master() isMaster: boolean,
    @IpLocation() ipLocation: IpRecord,
  ) {
    if (!isMaster) {
      await this.commentService.ValidAuthorName(author)
    }
    const pid = params.id
    const model = { ...body, ...ipLocation }
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
  async replyByCid(
    @Param() params: IdDto,
    @Body() body: CommentDto,
    @Body('author') author: string,
    @Master() isMaster: boolean,
    @IpLocation() ipLocation: IpRecord,
  ) {
    if (!isMaster) {
      await this.commentService.ValidAuthorName(author)
    }

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
      ...ipLocation,
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

  @Post('/master/comment/:id')
  @ApiOperation({ summary: '主人专用评论接口 需要登录' })
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('bearer')
  async commentByMaster(
    @Req() req: any,
    @Param() params: IdDto,
    @Body() body: TextOnlyDto,
    @IpLocation() ipLocation: IpRecord,
  ) {
    // console.log(req.user)
    const { name, mail, url } = req.user
    const model: CommentDto = {
      author: name,
      ...body,
      mail,
      url,
    }
    return await this.comment(params, model as any, undefined, true, ipLocation)
  }

  @Post('/master/reply/:id')
  @ApiOperation({ summary: '主人专用评论回复 需要登录' })
  @ApiParam({ name: 'id', description: 'cid' })
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('bearer')
  async replyByMaster(
    @Req() req: any,
    @Param() params: IdDto,
    @Body() body: TextOnlyDto,
    @IpLocation() ipLocation: IpRecord,
  ) {
    const { name, mail, url } = req.user
    const model: CommentDto = {
      author: name,
      ...body,
      mail,
      url,
    }
    return await this.replyByCid(params, model, undefined, true, ipLocation)
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

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(@Param() params: IdDto) {
    const { id } = params
    return await this.commentService.deleteComments(id)
  }
}
