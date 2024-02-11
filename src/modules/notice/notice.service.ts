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

  async getNoticeDetail(user, type) {
    const list = await this.noticeModel
      .find({
        to: user._id,
        // type,
      })
      .sort({ created_at: 1 })
      .populate('from', 'username avatar')
    // 自带的排序不起作用?

    // 存一下结果，然后改已读..这里之后也得搞分页...
    const ids = list.map((i) => i._id)
    await this.noticeModel.updateMany({ _id: { $in: ids } }, { is_read: true })
    return list
  }
}
