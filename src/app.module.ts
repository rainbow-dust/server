import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import { AppController } from './app.controller'
import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { CollectModule } from './modules/collect/collect.module'
import { CommentModule } from './modules/comment/comment.module'
import { NoticeModule } from './modules/notice/notice.module'
import { PostModule } from './modules/post/post.module'
import { TagModule } from './modules/tag/tag.module'
import { UserModule } from './modules/user/user.module'
import { DatabaseModule } from './processors/databse/database.module'
import { HelperModule } from './processors/helper/helper.module'

@Module({
  imports: [
    DatabaseModule,
    HelperModule,
    UserModule,
    PostModule,
    TagModule,
    CommentModule,
    CollectModule,
    NoticeModule,
  ],
  controllers: [AppController],

  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor, // 1
    },
  ],
})
export class AppModule {}
