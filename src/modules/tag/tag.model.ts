import { IsString } from 'class-validator'
import { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

@Schema({
  collection: 'tags',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  },
  versionKey: false,
})
export class TagModel extends Document {
  @Prop({ unique: true })
  @IsString({ message: '标签名' })
  name: string

  @Prop()
  @IsString({ message: '标签描述' })
  description: string

  @Prop({ default: 0 })
  heat: number
}
