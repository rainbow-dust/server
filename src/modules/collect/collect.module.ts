import { Module } from '@nestjs/common'

import { NoticeService } from '~/modules/notice/notice.service'

import { CollectController } from './collect.controller'
import { CollectService } from './collect.service'

@Module({
  providers: [CollectService, NoticeService],
  controllers: [CollectController],
})
export class CollectModule {}
