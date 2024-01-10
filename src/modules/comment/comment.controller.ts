import { Body, Controller, Post } from '@nestjs/common'

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
  // @Auth()
  async create(@Body() comment: CommentDto, @CurrentUser() user: UserModel) {
    return await this.commentService.create(comment, user)
  }
}
