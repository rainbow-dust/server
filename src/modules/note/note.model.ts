import { IsArray } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'
import { PartialType } from '@nestjs/swagger'

import { TagModel } from '../tag/tag.model'
import { UserModel } from '../user/user.model'

@Schema({
  collection: 'notes',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
})
export class NoteModel extends Document {
  @Prop()
  title: string

  @Prop()
  content: string

  @Prop()
  cover?: string

  @Prop()
  @IsArray()
  pic_list: Pic[]

  @Prop()
  video_urls?: string[]

  // https://github.com/nestjs/nest/issues/5716#issuecomment-730205272
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'TagModel',
  })
  @IsArray()
  tags: TagModel[]

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  author: UserModel

  // 这里是...查询的时候这样方便很多，字符串数组，不用转类型。反正一般也不会想 populate 这个东西
  @Prop({
    type: [String],
    message: '点赞用户',
    default: [],
  })
  @IsArray()
  like_user_ids: string[]

  @Prop({ default: 0 })
  read_count: number

  @Prop({ default: 0 })
  like_count: number

  @Prop({ default: 0 })
  comment_count: number
}

export interface Pic {
  url: string
  width: number
  height: number
}

export class PartialNoteModel extends PartialType(NoteModel) {}
