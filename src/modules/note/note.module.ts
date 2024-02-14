import { Module } from '@nestjs/common'

import { NoticeService } from '~/modules/notice/notice.service'

import { NoteController } from './note.controller'
import { NoteService } from './note.service'

@Module({
  controllers: [NoteController],
  providers: [NoteService, NoticeService],
  exports: [NoteService, NoticeService],
})
export class NoteModule {}
