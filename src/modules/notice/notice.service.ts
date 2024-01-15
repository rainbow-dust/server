import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { NoticeModel } from './notice.model'

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel('NoticeModel')
    private readonly noticeModel: Model<NoticeModel>,
  ) {}
  async getNoticeByUser(user) {
    return await this.noticeModel.find({ to: user._id })
  }
  async createNotice(notice) {
    return await this.noticeModel.create(notice)
  }
}
