import { IsArray, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { PostModel } from '../post/post.model'
import { UserModel } from '../user/user.model'

@Schema({
  collection: 'collects',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  },
  versionKey: false,
})
export class CollectModel extends Document {
  @Prop({ unique: true })
  @IsString({ message: '通知名？' })
  name: string

  @Prop()
  @IsString({ message: '通知描述' })
  message: string

  @Prop()
  @IsString({ message: '通知类型' })
  type: string

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  creator: UserModel

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'PostModel' }])
  @IsArray()
  post: PostModel[]
}
