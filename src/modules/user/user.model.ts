import { IsArray, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { CollectModel } from '../collect/collect.model'
import { PostModel } from '../post/post.model'
import { TagModel } from '../tag/tag.model'

@Schema({
  collection: 'users',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  },
  versionKey: false,
})
export class UserModel extends Document {
  @Prop({ unique: true })
  @IsString({ message: '用户名' })
  username: string

  @Prop({ select: false })
  @IsString({ message: '密码' })
  password: string

  @Prop({ select: false })
  authCode: string

  @Prop()
  avatar: string

  @Prop()
  bio: string

  @Prop()
  admin: boolean

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  @IsArray()
  followings: UserModel[]

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  @IsArray()
  followers: UserModel[]

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'PostModel',
  })
  @IsArray()
  likes: PostModel[]

  @IsArray()
  collects: CollectModel[]

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'TagModel',
  })
  @IsArray()
  preferences: TagModel[]
}
