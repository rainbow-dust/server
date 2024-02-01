import { IsArray, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { CollectModel } from '../collect/collect.model'
import { NoteModel } from '../note/note.model'
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
  avatar_url: string

  @Prop()
  bio: string

  @Prop({ select: false })
  admin: boolean

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  @IsArray()
  followees: UserModel[]

  @Prop({})
  followee_count: number

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  @IsArray()
  followers: UserModel[]

  @Prop({})
  follower_count: number

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'NoteModel',
    select: false,
  })
  @IsArray()
  like_note_ids: NoteModel[]

  @IsArray()
  collects: CollectModel[]

  @Prop()
  be_liked_count: number

  @Prop()
  be_collected_count: number

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'TagModel',
    select: false,
  })
  @IsArray()
  preferences: TagModel[]
}
