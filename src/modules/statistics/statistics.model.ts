// import { IsArray, IsBoolean, IsString } from 'class-validator'
import { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { NoteModel } from '../note/note.model'
import { UserModel } from '../user/user.model'

@Schema({
  collection: 'statistics',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false,
  },
  versionKey: false,
})
class StatisticsModel extends Document {
  // 因为很多地方要算差值而没法直接查..所以要记录一些绝对值。
  @Prop()
  total_user_count: number
  @Prop()
  total_note_count: number
  @Prop()
  total_note_like_count: number
  @Prop()
  total_note_read_count: number
  @Prop()
  created_at: Date

  popular_authors: {
    user: UserModel
    note_count: number
    like_count: number
    click_count: number
  }[]

  popular_notes: {
    note: NoteModel
    like_count: number
    collect_count: number
    click_count: number
  }[]

  popular_tags: {
    tag: string
    note_count: number
  }[]
}

@Schema({
  collection: 'statistic_actions',
  toObject: { virtuals: true, getters: true },
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false,
  },
  versionKey: false,
})
class StatisticActionsModel extends Document {
  // 这一部分统计... 也许先放放也行。数据结构想好了...但实施要的有点多...。
  // user: UserModel
  // start_time: Date
  // end_time: Date
  // duration: number
  // device: string
  // ip: string
  // location: string
  // actions:{
  //   type: string
  //   time: Date
  //   data: { [key: string]: any}
  // }[]
}

export { StatisticsModel, StatisticActionsModel }
