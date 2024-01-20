import { Body, Controller, Post } from '@nestjs/common'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'

import { NoticeService } from './notice.service'

@Controller('notice')
@ApiName
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}
  // 这里除了给用户提示... 还可以作为一个日志，统计之类的地方

  @Post()
  @Auth()
  async getNoticeByUser(
    @Body() type: string,

    @CurrentUser() user,
  ) {
    return await this.noticeService.getNoticeByUser(user)
  }
}
