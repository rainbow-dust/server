import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'

import { UserModel } from '../user/user.model'
import { CommentDto } from './comment.dto'
import { CommentService } from './comment.service'

@Controller('comment')
@ApiName
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/add')
  @Auth()
  async create(@Body() comment: CommentDto, @CurrentUser() user: UserModel) {
    return this.commentService.createComment(comment, user)
  }

  @Get('/post/:post_id/root_comment')
  @ApiOperation({ summary: '获取一级评论' })
  async getFirst(
    @Param('post_id') post_id: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.commentService.getRootComment(post_id, user)
  }

  @Get('/root_comment/:root_comment_id/child_comment')
  @ApiOperation({ summary: '获取二级评论' })
  async getSecond(
    @Param('root_comment_id') root_comment_id: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.commentService.getChildComment(root_comment_id, user)
  }

  @Post('/:comment_id/like')
  @Auth()
  async like(
    @Param('comment_id') comment_id: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.commentService.like(comment_id, user)
  }

  @Delete('/:comment_id/like')
  @Auth()
  async cancelLike(
    @Param('comment_id') comment_id: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.commentService.cancelLike(comment_id, user)
  }
}
