import { Module } from '@nestjs/common'

import { NoticeService } from '../notice/notice.service'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'

@Module({
  controllers: [CommentController],
  providers: [CommentService, NoticeService],
  exports: [CommentService, NoticeService],
})
export class CommentModule {}
