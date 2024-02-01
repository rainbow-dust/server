import { Model } from 'mongoose'

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { NoticeService } from '../notice/notice.service'
import { TagModel } from '../tag/tag.model'
import { UserModel } from '../user/user.model'
import { NoteDto, NoteListQuery, QueryType } from './note.dto'
import { NoteModel, PartialNoteModel } from './note.model'

@Injectable()
export class NoteService {
  constructor(
    @InjectModel('NoteModel')
    private readonly noteModel: Model<NoteModel>,
    @InjectModel('TagModel')
    private readonly tagModel: Model<TagModel>,
    private readonly noticeService: NoticeService,
    private readonly userModel: Model<UserModel>,
  ) {}
  async create(note: NoteDto, user: UserModel) {
    const tags = await Promise.all(
      note.tags?.map((name: string) => {
        return this.tagModel.findOne({ name })
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
    const note = await this.noteModel
      .findById(id)
      .populate('author tags')
      .lean()
    return note
  }

  // FIXME 无法查询到当前页面之外的文章，需要分组查询
  async notePaginate(noteQuery: NoteListQuery, user) {
    const { pageCurrent, pageSize, tags, sort, type, username } = noteQuery

    // // 找能找到的，去重去空
    // const _tags = Array.from(new Set(await Promise.all(
    //   tags?.map((i) => {
    //     return this.tagModel.findOne({ name: i })
    //   }),
    // ))).filter((i) => i)
    // console.log(_tags)
    // const _tagIds = _tags?.map((i) => i._id)

    const _tagNames = tags?.filter((i) => i)
    console.log(_tagNames)

    if (type === QueryType.user_preference) {
      // TODO
    }

    const noteList = await this.noteModel
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $unwind: '$author',
        },
        {
          $match: {
            'author.username': username ? username : { $exists: true },
          },
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          // tags 是个数组，_tagNames 也是个数组... 要找 tags.name 也就是tags 数组里面的 name 和 _tagNames 数组里面的 name 有交集的
          // 这里是不是用正则去搞一下更好一点？
          // 嗯..想了想大概是可以做到的，大不了再来几个查询... 只是...现在这样写，tmd 这个 mongoose 是不是啥也没干啊...
          $match: {
            $or: [
              _tagNames?.length > 0 ? { 'tags.name': { $in: _tagNames } } : {},
            ],
          },
        },
        {
          $addFields: {
            is_liked: {
              $in: [user?._id, '$like_user_ids'],
            },
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'totalCount' }],
            noteList: [
              { $sort: { created_at: -1 } },
              { $skip: (pageCurrent - 1) * pageSize },
              { $limit: pageSize },
            ],
          },
        },
      ]) // 这里返回的是一个数组...要脱壳
      .then((res) => {
        return {
          totalCount: res[0].metadata[0]?.totalCount,
          noteList: res[0].noteList,
        }
      })
    return noteList
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

    // 这里要考虑一个问题...。。。如果是自己点赞自己的文章，那么就不需要通知了,另一个是，如果短时间内点赞了多次，那么也不需要通知了
    // 但要在哪里缓存? 还是就通过数据库里的 (created_at) + from + to + type + topic 来判断?
    await this.noticeService.createNotice({
      type: 'like',
      topic: _note,
      description: '点赞了你的文章',
      is_read: false,
      from: user,
      to: _note.author,
    })

    // 在 user 表里面的 like_note_ids 里面添加这个文章的 id
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $push: { like_note_ids: _note._id },
      },
    )

    return await this.noteModel
      .findByIdAndUpdate(id, {
        $push: { like_user_ids: user._id },
        $set: { like_count: _note.like_user_ids.length + 1 },
      })
      .populate('author tags')
      .lean()
      .then((res) => {
        return {
          ...res,
          is_liked: true,
          like_count: res.like_count + 1,
        }
      })
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

    // 在 user 表里面的 like_note_ids 里面删除这个文章的 id
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $pull: { like_note_ids: _note._id },
      },
    )

    return await this.noteModel
      .findByIdAndUpdate(id, {
        $pull: { like_user_ids: user._id },
        $set: { like_count: _note.like_user_ids.length - 1 },
      })
      .populate('author tags')
      .lean()
      .then((res) => {
        return {
          ...res,
          is_liked: false,
          like_count: res.like_count - 1,
        }
      })
  }

  get model() {
    return this.noteModel
  }
}
