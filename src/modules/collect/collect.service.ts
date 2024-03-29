import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { NoteModel } from '~/modules/note/note.model'
import { NoticeService } from '~/modules/notice/notice.service'
import { UserModel } from '~/modules/user/user.model'

import { CollectModifyDto } from './collect.dto'
import { CollectModel } from './collect.model'

@Injectable()
export class CollectService {
  constructor(
    @InjectModel('CollectModel')
    private readonly collectModel: Model<CollectModel>,
    @InjectModel('UserModel')
    private readonly userModel: Model<UserModel>,
    @InjectModel('NoteModel')
    private readonly noteModel: Model<NoteModel>,
    private readonly noticeService: NoticeService,
  ) {}

  async create(collect: CollectModifyDto, user: UserModel) {
    return this.collectModel.create({
      ...collect,
      creator: user._id,
    })
  }

  async queryList(collectListQueryDto) {
    const { username, noteId } = collectListQueryDto
    const _user = await this.userModel.findOne({ username })
    const _collects = await this.collectModel
      .find({ creator: _user._id })
      // 加入是否收藏了这个文章... 我看了...知乎似乎是任意一个收藏都能查到，小红书就是只有默认收藏夹才直接反应在下边那个小黄星星那里...
      // 但是为了一个小黄星星，...翻这么多东西...值得吗...也许是可以的...
      .lean()
      .then((res) => {
        if (noteId) {
          return Promise.all(
            res.map(async (collect) => {
              // 又是 ObjectId 和 string 的问题... 有点烦...
              collect['is_collected'] = collect.notes.some(
                (i) => i.toString() === noteId,
              )
              return collect
            }),
          )
        }
        return res
      })
    return _collects
  }

  async queryDetail(collectDetailQueryDto, user: UserModel) {
    const _collect = await this.collectModel
      .findOne({
        _id: collectDetailQueryDto.collectId,
      })
      .populate('notes')
    return _collect
  }

  async update(collect: CollectModifyDto, user: UserModel) {
    const _collect = await this.collectModel
      .findOne({ _id: collect._id })
      .exec()
    // 确认得是自己的收藏夹
    if (_collect.creator.toString() != user._id) {
      throw new Error('无修改权限')
    }
    return this.collectModel.updateOne({ _id: collect._id }, collect)
  }

  async delete(collectId: string, user) {
    const _collect = await this.collectModel.findOne({ _id: collectId })
    if (_collect.creator.toString() != user._id) {
      throw new Error('无修改权限')
    }
    return this.collectModel.deleteOne({ _id: collectId, creator: user._id })
  }

  async addNoteToCollect(collectNoteDto, collectId: string, user: UserModel) {
    const _collect = await this.collectModel.findOne({ _id: collectId })
    if (_collect.creator.toString() != user._id.toString()) {
      throw new Error('无修改权限')
    }

    // 这里应该是要判断是否已经收藏了这个文章
    if (_collect.notes.includes(collectNoteDto.noteId)) {
      throw new Error('已经收藏了这篇文章')
    }
    // 更新 note 的 collect_count 字段
    const _note = await this.noteModel
      .updateOne({ _id: collectNoteDto.noteId }, { $inc: { collect_count: 1 } })
      .then((res) => {
        return this.noteModel.findById(collectNoteDto.noteId)
      })

    await this.noticeService.createNotice({
      type: 'collect',
      topic: _note._id,
      description: '收藏了你的文章',
      is_read: false,
      from: user._id,
      to: _note.author,
    })

    return this.collectModel.updateOne(
      { _id: collectId },
      { $push: { notes: collectNoteDto.noteId } },
    )
  }

  async removeNoteFromCollect(
    collectNoteDto,
    collectId: string,
    user: UserModel,
  ) {
    const _collect = await this.collectModel.findOne({ _id: collectId })
    if (_collect.creator.toString() != user._id) {
      throw new Error('无修改权限')
    }

    await this.noteModel.updateOne(
      { _id: collectNoteDto.noteId },
      { $inc: { collect_count: -1 } },
    )

    return this.collectModel.updateOne(
      { _id: collectId },
      { $pull: { notes: collectNoteDto.noteId } },
    )
  }
}
