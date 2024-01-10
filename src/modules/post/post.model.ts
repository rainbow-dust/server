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
    createdAt: 'created',
    updatedAt: true,
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
  tags?: TagModel[]

  @Prop({ default: 0 })
  read: number

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
  })
  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  user: UserModel

  @Prop([{ type: () => mongoose.Schema.Types.ObjectId, ref: 'CommentModel' }])
  @IsArray()
  comments: CommentModel[]
}

export class PartialPostModel extends PartialType(PostModel) {}
