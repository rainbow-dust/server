// import { IsArray, IsBoolean, IsString } from 'class-validator'
import { Document } from 'mongoose'

import { Prop, Schema } from '@nestjs/mongoose'

import { NoteModel } from '~/modules/note/note.model'
import { UserModel } from '~/modules/user/user.model'

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
  @Prop()
  patch_id: string

  @Prop()
  user: UserModel

  @Prop()
  type: string

  @Prop()
  action: string

  @Prop()
  time_stamp: Date

  @Prop()
  page_url: string

  @Prop()
  device: string

  @Prop()
  os: string

  @Prop()
  browser: string

  @Prop()
  ip: string

  @Prop()
  location: string

  @Prop({
    type: Map,
  })
  extra_data_for_event: ExtraData
  // ...怎么不能写 any...
}

type ExtraData = ActionClickData | ActionScrollData | RequestData

type ActionClickData = {
  height: number
  width: number
  x: number
  y: number
  target: string
}

type ActionScrollData = {
  distance: number
  scrollTop: number
}

type RequestData = {
  url: string
  method: string
  headers: string
  body: string
  cost_time: number
  status_code: number
}

export { StatisticsModel, StatisticActionsModel }
