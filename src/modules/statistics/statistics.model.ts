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
  @Prop()
  total_request_count: number

  @Prop()
  popular_authors: {
    user: UserModel
    note_count: number
    like_count: number
    click_count: number
  }[]

  @Prop()
  popular_notes: {
    note: NoteModel
    like_count: number
    collect_count: number
    click_count: number
  }[]

  @Prop()
  popular_tags: {
    tag: string
    note_count: number
  }[]

  @Prop()
  popular_requests: {
    url: string
    method: string
    count: number
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

  @Prop({
    message: '用户信息',
    type: String,
    index: true,
  })
  user: UserModel

  @Prop()
  device: string

  /* ip location 什么的浏览器做了限制 js 不能访问，通常是由服务端接收请求后再发给前端... 所以先不做了 */
  // @Prop()
  // ip: string

  // @Prop()
  // location: string

  /* 这条注释以上的信息可以确定是一个批次内不会变动的。 */

  @Prop()
  time_stamp: string

  @Prop()
  page_url: string

  @Prop({
    message: '统计类型， request 还是 action',
    index: true,
  })
  type: string

  @Prop({
    message: '统计动作就是 action 分类，有 click scroll 等',
  })
  action?: string

  @Prop({
    message:
      '额外数据，具体类型依据 type 和 action 而定... 而这里有可能才是分析重点',
    type: Object,
  })
  extra_data_for_event: ExtraData | any
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
  scroll_top: number
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
