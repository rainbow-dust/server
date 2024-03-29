import { IsArray, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { CollectionStatus } from '~/constants/enum'
import { CollectModel } from '~/modules/collect/collect.model'
import { NoteModel } from '~/modules/note/note.model'
import { TagModel } from '~/modules/tag/tag.model'

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
  cover_url: string

  @Prop()
  bio: string

  @Prop({ default: 'user' })
  role: 'admin' | 'user'

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    default: [],
  })
  @IsArray()
  followees: UserModel[]

  @Prop({})
  followee_count: number

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    default: [],
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

  @Prop({ default: 0 })
  be_liked_count: number

  @Prop({ default: 0 })
  be_collected_count: number

  @Prop({ default: 0 })
  note_count: number

  @Prop()
  @IsArray()
  preferences: Preference[]

  @Prop({ default: 'normal' })
  status: CollectionStatus
}

interface Preference {
  tag: TagModel
  score: number
}
