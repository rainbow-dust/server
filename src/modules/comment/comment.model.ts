import { IsArray, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { PostModel } from '../post/post.model'
import { UserModel } from '../user/user.model'

@Schema({
  collection: 'comments',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  },
  versionKey: false,
})
export class CommentModel extends Document {
  @Prop()
  @IsString({ message: '一级评论内容' })
  content: string

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  author: UserModel

  @Prop({ type: () => mongoose.Schema.Types.ObjectId, ref: 'PostModel' })
  post_id: PostModel

  @Prop()
  @IsArray()
  nested_comments: NestedComment[]

  @Prop({ default: 0 })
  nested_comments_count: number
}

@Schema({
  collection: 'nested_comments',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  },
  versionKey: false,
})
export class NestedComment extends Document {
  mentionee_author: UserModel
  mentionee: CommentModel
  author: UserModel
  content: string
  created: Date
}
