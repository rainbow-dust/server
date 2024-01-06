import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'

import { PostModel } from '~/modules/post/post.model'
import { UserModel } from '~/modules/user/user.model'

export const databaseModels = [UserModel, PostModel].map((model: any) =>
  MongooseModule.forFeature([
    { name: model.name, schema: SchemaFactory.createForClass(model) },
  ]),
)
