import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UserModel } from '../user/user.model'
import { CollectModifyDto } from './collect.dto'
import { CollectModel } from './collect.model'

@Injectable()
export class CollectService {
  constructor(
    @InjectModel('CollectModel')
    private readonly collectModel: Model<CollectModel>,
  ) {}

  async create(collect: CollectModifyDto, user: UserModel) {
    console.log('collect', collect, user._id)
    return this.collectModel.create({
      ...collect,
      creator: user._id,
    })
  }

  async queryList(collectListQueryDto) {
    const { username, noteId } = collectListQueryDto
    const _collects = await this.collectModel.find({ creator: username })
    // 加入是否收藏了这个文章... 我看了...知乎似乎是任意一个收藏都能查到，小红书就是只有默认收藏夹才直接反应在下边那个小黄星星那里...
    // 但是为了一个小黄星星，...翻这么多东西...值得吗...也许是可以的...
    if (noteId) {
      _collects.forEach((collect) => {
        collect['is_collected'] = collect.notes.some(
          (note) => note.toString() == noteId,
        )
      })
    }
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
    const _collect = await this.collectModel.findOne({ _id: collect._id })
    // 确认得是自己的收藏夹
    if (_collect.creator != user._id) {
      throw new Error('无修改权限')
    }
    return this.collectModel.updateOne({ _id: collect._id }, collect)
  }

  async delete(collectId: string, user) {
    const _collect = await this.collectModel.findOne({ _id: collectId })
    if (_collect.creator != user._id) {
      throw new Error('无修改权限')
    }
    return this.collectModel.deleteOne({ _id: collectId, creator: user._id })
  }

  async addNoteToCollect(collectNoteDto, collectId: string, user: UserModel) {
    const _collect = await this.collectModel.findOne({ _id: collectId })
    if (_collect.creator != user._id) {
      throw new Error('无修改权限')
    }
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
    if (_collect.creator != user._id) {
      throw new Error('无修改权限')
    }
    return this.collectModel.updateOne(
      { _id: collectId },
      { $pull: { notes: collectNoteDto.noteId } },
    )
  }
}
