import { join } from 'path'

import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'

import { AppController } from './app.controller'
import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { CollectModule } from './modules/collect/collect.module'
import { CommentModule } from './modules/comment/comment.module'
import { NoteModule } from './modules/note/note.module'
import { NoticeModule } from './modules/notice/notice.module'
import { StatisticsModule } from './modules/statistics/statistics.module'
import { TagModule } from './modules/tag/tag.module'
import { UploadModule } from './modules/upload/upload.module'
import { UserModule } from './modules/user/user.module'
import { DatabaseModule } from './processors/databse/database.module'
import { HelperModule } from './processors/helper/helper.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    HelperModule,
    UserModule,
    NoteModule,
    TagModule,
    CommentModule,
    CollectModule,
    NoticeModule,
    UploadModule,
    StatisticsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
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
