import { IsArray } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'
import { PartialType } from '@nestjs/swagger'

import { CommentModel } from '../comment/comment.model'
import { TagModel } from '../tag/tag.model'
import { UserModel } from '../user/user.model'

@Schema({
  collection: 'posts',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
})
export class PostModel extends Document {
  @Prop()
  title: string

  @Prop()
  content: string

  @Prop()
  cover?: string

  @Prop()
  @IsArray()
  pic_urls: string[]

  @Prop()
  video?: string

  @Prop()
  tags?: TagModel[]

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
  })
  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    index: true,
  })
  author: UserModel

  @Prop([{ type: () => mongoose.Schema.Types.ObjectId, ref: 'CommentModel' }])
  @IsArray()
  comments: CommentModel[]

  @Prop([
    {
      type: () => mongoose.Schema.Types.ObjectId,
    },
  ])
  @IsArray()
  likes: UserModel[]

  @Prop({ default: 0 })
  read: number

  @Prop({ default: 0 })
  likes_count: number

  @Prop({ default: 0 })
  comments_count: number
}

export class PartialPostModel extends PartialType(PostModel) {}
