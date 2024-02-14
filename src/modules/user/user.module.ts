import { Module } from '@nestjs/common'

import { AuthModule } from '~/modules/auth/auth.module'
import { NoticeService } from '~/modules/notice/notice.service'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, NoticeService],
  exports: [UserService],
})
export class UserModule {}
