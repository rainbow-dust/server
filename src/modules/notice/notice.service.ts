import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { NoticeDto } from './notice.dto'
import { NoticeModel } from './notice.model'

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel('NoticeModel')
    private readonly noticeModel: Model<NoticeModel>,
  ) {}

  async getNoticeCount(user, type) {
    return await this.noticeModel.countDocuments({
      to: user._id,
      // type,
      is_read: false,
    })
  }

  // 这里也许可以直接引入到别的地方给别的模块调用
  async createNotice(notice: NoticeDto) {
    // 这里要考虑一个问题...。。。如果是自己点赞自己的文章，那么就不需要通知了,另一个是，如果短时间内点赞了多次，那么也不需要通知了
    // 但要在哪里缓存? 还是就通过数据库里的 (created_at) + from + to + type + topic 来判断?

    const _notice = await this.noticeModel.findOne({
      from: notice.from,
      to: notice.to,
      type: notice.type,
      topic: notice.topic,
    })

    if (_notice) {
      return
    }
    return await this.noticeModel.create(notice)
  }

  async getNoticeDetail(user, queryListDto) {
    const { pageCurrent, pageSize, type } = queryListDto
    const _notices = this.noticeModel
      .find({ to: user._id })
      .sort({ created: -1 })
      .skip((pageCurrent - 1) * pageSize)
      .limit(pageSize)
      .populate('from', 'username avatar_url')

    // ...https://stackoverflow.com/questions/53554434/return-updated-models-in-mongoose-using-updatemany
    await this.noticeModel.updateMany({ to: user._id }, { is_read: true })

    return _notices
  }
}
