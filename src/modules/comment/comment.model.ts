import { IsArray, IsOptional, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { CollectionStatus } from '~/constants/enum'
import { NoteModel } from '~/modules/note/note.model'
import { UserModel } from '~/modules/user/user.model'

@Schema({
  collection: 'comments',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false,
  },
  versionKey: false,
})
export class CommentModel extends Document {
  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'NoteModel',
    message: '所属文章',
    index: true,
  })
  note_id: NoteModel

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  author: UserModel

  @Prop()
  @IsString({ message: '评论内容' })
  content: string

  @Prop([
    {
      type: () => mongoose.Schema.Types.ObjectId,
      ref: 'UserModel',
      message: '点赞用户',
    },
  ])
  @IsArray()
  @IsOptional()
  like_user_ids: UserModel[]

  @Prop({ default: 0, message: '点赞数' })
  @IsOptional()
  like_count: number

  @Prop({ message: '子评论数，只有 root_comment 才有' })
  @IsOptional()
  child_comment_count: number

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'CommentModel',
    message:
      '被回复的评论，若为空，则为 root_comment，非空则 child_comment，填入的也永远只是 root_comment，暂不打算支持多级回复',
  })
  @IsOptional()
  root_comment_id: CommentModel

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    message: '被回复者，在 child_comment 中@回复某人时有',
  })
  mentionee: UserModel

  @Prop({ default: 'normal' })
  status: CollectionStatus
}
