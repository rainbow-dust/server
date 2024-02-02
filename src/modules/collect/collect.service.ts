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

  async queryList(user) {
    return this.collectModel.find({ creator: user._id })
  }

  async queryDetail(collectId: string, user) {
    return this.collectModel.findOne({ _id: collectId, creator: user._id })
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

  async addNoteToCollect(noteId: string, collectId: string, user) {
    const _collect = await this.collectModel.findOne({ _id: collectId })
    if (_collect.creator != user._id) {
      throw new Error('无修改权限')
    }

    return this.collectModel.updateOne(
      { _id: collectId, creator: user._id },
      { $addToSet: { notes: noteId } },
    )
  }

  async removeNoteFromCollect(noteId: string, collectId: string, user) {
    const _collect = await this.collectModel.findOne({ _id: collectId })
    if (_collect.creator != user._id) {
      throw new Error('无修改权限')
    }

    return this.collectModel.updateOne(
      { _id: collectId, creator: user._id },
      { $pull: { notes: noteId } },
    )
  }
}
