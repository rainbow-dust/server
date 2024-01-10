import { Controller } from '@nestjs/common'

import { ApiName } from '~/common/decorator/openapi.decorator'

import { NoticeService } from './notice.service'

@Controller('notice')
@ApiName
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}
}
