import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator'
import mongoose, { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { NoteModel } from '../note/note.model'
import { UserModel } from '../user/user.model'

@Schema({
  collection: 'collects',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false,
  },
  versionKey: false,
})
export class CollectModel extends Document {
  @Prop({ required: true })
  @IsString({ message: '收藏名' })
  name: string

  @Prop()
  @IsString({ message: '收藏描述' })
  desc: string

  @Prop({
    type: () => mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    required: true,
  })
  creator: UserModel

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }],
    // 类似...多人协作
  })
  @IsOptional()
  maintainer: UserModel[]

  @Prop()
  @IsBoolean()
  is_public: boolean

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'NoteModel',
    select: false,
  })
  @IsArray()
  notes: NoteModel[]
}
