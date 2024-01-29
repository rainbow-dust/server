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
    return await this.noticeModel.create(notice)
  }

  async getNoticeDetail(user, type) {
    const list = await this.noticeModel
      .find({
        to: user._id,
        // type,
      })
      .populate('from', 'username avatar')
      .sort({ create_at: -1 })

    // 存一下结果，然后改已读..这里之后也得搞分页...
    const ids = list.map((i) => i._id)
    await this.noticeModel.updateMany({ _id: { $in: ids } }, { is_read: true })
    return list
  }
}
