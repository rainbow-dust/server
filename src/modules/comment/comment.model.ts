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
  postId: PostModel

  @Prop()
  @IsArray()
  nestedComment: NestedComment[]
}

export interface NestedComment {
  mentioneeAuthor: UserModel
  mentionee: CommentModel
  creator: UserModel
  content: string
  created: Date
}
