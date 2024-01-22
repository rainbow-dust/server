import { Model } from 'mongoose'

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { TagModel } from '../tag/tag.model'
import { UserModel } from '../user/user.model'
import { NoteDto, NoteList, QueryType } from './note.dto'
import { NoteModel, PartialNoteModel } from './note.model'

@Injectable()
export class NoteService {
  constructor(
    @InjectModel('NoteModel')
    private readonly noteModel: Model<NoteModel>,
    @InjectModel('TagModel')
    private readonly tagModel: Model<TagModel>,
  ) {}
  async create(note: NoteDto, user: UserModel) {
    const tags = await Promise.all(
      note.tags?.map((i) => {
        return this.tagModel.findById(i)
      }),
    )
    return this.noteModel.create({
      ...note,
      author: user._id,
      tags: tags?.map((i) => i._id),
    })
  }

  async findNoteById(id: string) {
    const _note = await this.noteModel.findById(id)
    if (!_note) {
      throw new ForbiddenException('文章不存在')
    }
    await this.noteModel.updateOne({ _id: id }, { $inc: { read: 1 } })
    const note = await this.noteModel.findById(id).populate('author').lean()
    return note
  }

  // FIXME 无法查询到当前页面之外的文章，需要分组查询
  async notePaginate(note: NoteList, user) {
    const { pageCurrent, pageSize, tags, sort, type, username } = note

    if (type === QueryType.user_preference) {
      // TODO
    }

    // ...

    // const noteList1 = await this.noteModel.aggregate([
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'author',
    //       foreignField: '_id',
    //       as: 'author',
    //       // 不要把所有的用户信息都返回...
    //       pipeline: [
    //         {
    //           $project: {
    //             password: 0,
    //             authCode: 0,
    //             admin: 0,
    //           },
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $project: {
    //       content: {
    //         $substrCP: ['$content', 1, 100],
    //       },
    //       _id: 1,
    //       title: 1,
    //       created: 1,
    //       cover: 1,
    //       pic_urls: 1,
    //       read: 1,
    //       updatedAt: 1,
    //       like_user_ids: 1,
    //       likes_count: {
    //         $size: '$like_user_ids',
    //       },
    //       author: {
    //         $arrayElemAt: ['$author', 0],
    //       },
    //     },
    //   },
    //   {
    //     $match: {
    //       'author.username': username || { $exists: true }, // 这里想要的是... 如果username存在，就匹配username，如果不存在，就匹配所有...但是有些没有author的文章，就会被排除掉...虽然是因为错误数据...
    //     },
    //   },
    //   // {
    //   //   $sort: {
    //   //     read: sort != Sort.Newest ? -1 : 1,
    //   //     created: -1,
    //   //   },
    //   // },
    //   {
    //     $skip: pageSize * (pageCurrent - 1),
    //   },
    //   {
    //     $limit: pageSize,
    //   },
    // ])

    // const noteList = await this.noteModel.populate(noteList1, 'author')

    // 分页之后再做...
    const noteList = await this.noteModel
      .find()
      .populate('author')
      .populate('tags')
      .lean()

    if (user?._id) {
      noteList?.forEach((note) => {
        note['is_liked'] = note.like_user_ids
          ?.map((i) => i.toString())
          .includes(user._id)
      })
    }

    // 这里之后...要不压根不算 total...
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
      like_user_ids: user._id,
    })
    if (hasLiked) {
      throw new BadRequestException('已点赞')
    }
    return await this.noteModel.updateOne(
      { _id: id },
      { $push: { like_user_ids: user._id } },
      { $inc: { likes_count: 1 } },
    )
  }

  async unlike(id: string, user: UserModel) {
    const _note = await this.noteModel.findById(id)
    if (!_note) {
      throw new BadRequestException('文章不存在')
    }
    const hasLiked = await this.noteModel.findOne({
      _id: id,
      like_user_ids: user._id,
    })
    if (!hasLiked) {
      throw new BadRequestException('未点赞')
    }
    return await this.noteModel.updateOne(
      { _id: id },
      { $pull: { like_user_ids: user._id } },
      { $inc: { likes_count: -1 } },
    )
  }

  get model() {
    return this.noteModel
  }
}
