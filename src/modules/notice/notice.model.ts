import { IsBoolean, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { UserModel } from '../user/user.model'

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
  @Prop({ unique: true })
  @IsString({ message: '标签名' })
  name: string

  @Prop()
  @IsString({ message: '标签描述' })
  description: string

  @Prop()
  @IsBoolean()
  isRead: boolean

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  from: UserModel | string
  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
  })
  to: UserModel
}
