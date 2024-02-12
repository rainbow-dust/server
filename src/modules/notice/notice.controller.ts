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

  @Post('count')
  @Auth()
  async getNoticeCountByUser(@CurrentUser() user, @Body() type?: string) {
    return await this.noticeService.getNoticeCount(user, type)
  }

  @Post('query/list')
  @Auth()
  async readNoticeList(
    @CurrentUser() user,
    @Body()
    queryListDto: { pageCurrent: number; pageSize: number; type?: string },
  ) {
    return await this.noticeService.getNoticeDetail(user, queryListDto)
  }
}
