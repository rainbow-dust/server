import { IsBoolean, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { CommentModel } from '~/modules/comment/comment.model'
import { NoteModel } from '~/modules/note/note.model'
import { UserModel } from '~/modules/user/user.model'

@Schema({
  collection: 'notices',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  },
  versionKey: false,
})
export class NoticeModel extends Document {
  @Prop()
  @IsString({ message: '通知类型，应该有点赞，回复，关注等等' })
  type: string

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    refPath: 'type',
    message: '通知主题...就是，通过什么触发了通知...',
  })
  topic: UserModel | NoteModel | CommentModel

  @Prop()
  @IsString({ message: '通知描述' })
  description: string

  @Prop()
  @IsBoolean()
  is_read: boolean

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    message: '谁触发了通知',
  })
  from: UserModel
  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    message: '通知谁',
  })
  to: UserModel
}
