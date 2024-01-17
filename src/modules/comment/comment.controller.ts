import { Body, Controller, Get, Param, Post } from '@nestjs/common'
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
    if (comment.mentionee) {
      return this.commentService.createSecond(comment, user)
    } else {
      return this.commentService.createFirst(comment, user)
    }
  }

  @Get('/:id/children')
  @ApiOperation({ summary: '获取二级评论' })
  async getSecond(@Param('id') id: string) {
    return this.commentService.getSecond(id)
  }
}
