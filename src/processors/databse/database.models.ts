import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'

import { CollectModel } from '~/modules/collect/collect.model'
import { CommentModel } from '~/modules/comment/comment.model'
import { NoteModel } from '~/modules/note/note.model'
import { NoticeModel } from '~/modules/notice/notice.model'
import { TagModel } from '~/modules/tag/tag.model'
import { UserModel } from '~/modules/user/user.model'

export const databaseModels = [
  UserModel,
  NoteModel,
  TagModel,
  CommentModel,
  CollectModel,
  NoticeModel,
].map((model: any) =>
  MongooseModule.forFeature([
    { name: model.name, schema: SchemaFactory.createForClass(model) },
  ]),
)
