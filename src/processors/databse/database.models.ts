import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'

import { CollectModel } from '~/modules/collect/collect.model'
import { CommentModel } from '~/modules/comment/comment.model'
import { NoticeModel } from '~/modules/notice/notice.model'
import { PostModel } from '~/modules/post/post.model'
import { TagModel } from '~/modules/tag/tag.model'
import { UserModel } from '~/modules/user/user.model'

export const databaseModels = [
  UserModel,
  PostModel,
  TagModel,
  CommentModel,
  CollectModel,
  NoticeModel,
].map((model: any) => {
  console.log(model.name)
  return MongooseModule.forFeature([
    { name: model.name, schema: SchemaFactory.createForClass(model) },
  ])
})
