// import { IsArray, IsBoolean, IsString } from 'class-validator'
import { Document } from 'mongoose'

import { Schema } from '@nestjs/mongoose'

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
  base_statistics: {
    range: string
    active_user_count: number
    publish_note_count: number
    publish_comment_count: number
    publish_like_count: number
    publish_click_count: number
  }[]

  popular_author_statistics: {
    range: string
    popular_authors: {
      user: UserModel
      note_count: number
      like_count: number
      click_count: number
    }[]
  }[]

  popular_tag_statistics: {
    range: string
    popular_tags: {
      tag: string
      refer_count: number
    }[]
  }[]

  popular_note_statistics: {
    range: string
    popular_notes: {
      note: NoteModel
      like_count: number
      click_count: number
    }[]
  }[]

  // '0:00-2:00', '2:00-4:00', '4:00-6:00', '6:00-8:00', '8:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-24:00'
  note_publish_statistics: {
    range: string
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
