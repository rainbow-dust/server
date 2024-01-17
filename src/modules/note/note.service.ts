import { Model } from 'mongoose'

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UserModel } from '../user/user.model'
import { NoteDto, NoteList, QueryType } from './note.dto'
import { NoteModel, PartialNoteModel } from './note.model'

@Injectable()
export class NoteService {
  constructor(
    @InjectModel('NoteModel')
    private readonly noteModel: Model<NoteModel>,
  ) {}
  async create(note: NoteDto, user: UserModel) {
    return this.noteModel.create({ ...note, author: user._id })
  }

  async findNoteById(id: string) {
    const _note = await this.noteModel.findById(id)

    if (!_note) {
      throw new ForbiddenException('文章不存在')
    }
    await this.noteModel.updateOne({ _id: id }, { $inc: { read: 1 } })
    const note = await this.noteModel
      .findById(id)
      // .populate('category user')
      .lean()
    note.id = note._id
    return note
  }

  // FIXME 无法查询到当前页面之外的文章，需要分组查询
  async notePaginate(note: NoteList) {
    const { pageCurrent, pageSize, tags, sort, type } = note

    if (type === QueryType.user_preference) {
      // TODO
    }

    // ...

    const noteList = await this.noteModel.populate(
      await this.noteModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $project: {
            content: {
              $substrCP: ['$content', 1, 100],
            },
            _id: 1,
            title: 1,
            tags: 1,
            created: 1,
            cover: 1,
            pic_urls: 1,
            read: 1,
            updatedAt: 1,
            user: {
              $arrayElemAt: ['$user', 0],
            },
          },
        },
        // {
        //   $match: {
        //     tags: { $in: tags },
        //   },
        // },
        // {
        //   $sort: {
        //     read: sort != Sort.Newest ? -1 : 1,
        //     created: -1,
        //   },
        // },
        {
          $skip: pageSize * (pageCurrent - 1),
        },
        {
          $limit: pageSize,
        },
      ]),
      { path: 'category user' },
    )

    const totalCount = await this.noteModel.count()
    const totalPages = Math.ceil(totalCount / pageSize)
    return {
      noteList,
      totalCount,
      totalPages,
    }
  }

  async deleteNote(id: string) {
    const _note = await this.noteModel.findById(id)
    if (!_note) {
      throw new ForbiddenException('文章不存在')
    }
    await this.noteModel.findByIdAndDelete(id)
    return
  }

  async updateById(id: string, note: PartialNoteModel) {
    const oldNote = await this.noteModel.findById(id, 'category')
    if (!oldNote) {
      throw new BadRequestException('文章不存在')
    }
    await this.noteModel.updateOne({ _id: id }, note)
    return
  }

  async like(id: string, user: UserModel) {
    const _note = await this.noteModel.findById(id)
    if (!_note) {
      throw new BadRequestException('文章不存在')
    }
    const hasLiked = await this.noteModel.findOne({
      _id: id,
      likes: user._id,
    })
    if (hasLiked) {
      throw new BadRequestException('已点赞')
    }
    return await this.noteModel.updateOne(
      { _id: id },
      { $push: { likes: user._id } },
    )
  }

  async unlike(id: string, user: UserModel) {
    const _note = await this.noteModel.findById(id)
    if (!_note) {
      throw new BadRequestException('文章不存在')
    }
    const hasLiked = await this.noteModel.findOne({
      _id: id,
      likes: user._id,
    })
    if (!hasLiked) {
      throw new BadRequestException('未点赞')
    }
    return await this.noteModel.updateOne(
      { _id: id },
      { $pull: { likes: user._id } },
    )
  }

  get model() {
    return this.noteModel
  }
}
