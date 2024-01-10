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
  creator: UserModel

  @Prop([{ type: () => mongoose.Schema.Types.ObjectId, ref: 'PostModel' }])
  @IsArray()
  post: PostModel[]

  @Prop()
  @IsArray()
  nestedComment: NestedComment[]
}

export interface NestedComment {
  beRepliedUser: UserModel
  beRepliedComment: CommentModel
  creator: UserModel
  content: string
  post: PostModel
  created: Date
}
