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
    @InjectModel('UserModel')
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
      cover: note.pic_list?.[0], // 将第一张图片作为封面
      author: user._id,
      tags: tags?.map((i) => i._id),
    })
  }

  async findNoteById(id: string, user: UserModel) {
    const _note = await this.noteModel.findById(id).select('tags')
    if (!_note) {
      throw new ForbiddenException('文章不存在')
    }
    if (user?._id) {
      // 有则更新权重，无则创建, 对于 preferences 中存在的 tag，权重 + 1，不存在则创建
      const _user = await this.userModel
        .findById(user._id)
        .select('preferences')
      const _preferences = _user.preferences
      const _newPreferences = _preferences.map((i) => {
        if (_note.tags.includes(i.tag)) {
          i.score += 1
          return i
        }
        return i
      })
      _note.tags.forEach((i) => {
        if (!_preferences.find((j) => j.tag.toString() === i.toString())) {
          _newPreferences.push({ tag: i, score: 1 })
        }
      })

      await this.userModel.updateOne(
        { _id: user._id },
        {
          $set: { preferences: _newPreferences },
        },
      )
      console.log(_newPreferences)
    }
    await this.noteModel.updateOne({ _id: id }, { $inc: { read: 1 } })
    const note = await this.noteModel
      .findById(id)
      .populate('author tags')
      .lean()
      // 加 is_liked 字段
      .then((res) => {
        return {
          ...res,
          is_liked: user?._id ? res.like_user_ids?.includes(user._id) : false,
        }
      })
    return note
  }

  async getRecommend(
    pagination: { pageCurrent?: number; pageSize: number; lastId?: string },
    user: UserModel,
  ) {
    console.log(pagination)
    let _preferences = []
    if (user?._id) {
      const _user = await this.userModel
        .findById(user._id)
        .select('preferences')
      _preferences = _user.preferences
    }

    // TODO
    // 这里要结合，用户喜好，内容相似度，热度等等... 另外也要考虑不要重复推荐，不要推荐已经看过的...至少别单次使用内就重复，不要推荐点过喜欢的...
    // 现在的想法是，一次会话内，做一个个区间，因为ObjectId 是有序的，所以可以用这个来作为分界。然后每次查询的时候，都是查询这个分界之后的数据，去掉点过喜欢的，然后再根据用户的喜好，内容相似度，热度等等来排序，选出最合适的几篇文章。

    // 这里先简单的返回一些热门的文章
    const noteList = await this.noteModel
      .find({ _id: { $ne: pagination.lastId } })
      .sort({ like_count: -1 })
      .limit(pagination.pageSize)
      .populate('author tags')
      .lean()
    return noteList
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
    // const _tagIds = _tags?.map((i) => i._id)

    const _tagNames = tags?.filter((i) => i)

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

    await this.noticeService.createNotice({
      type: 'like',
      topic: _note,
      description: '点赞了你的文章',
      is_read: false,
      from: user,
      to: _note.author,
    })

    // 在 user 表里面的 like_note_ids 里面添加这个文章的 id
    // 想想...也许单独再搞一个表也是可以的...查询的时候找的接口可能也会，更符合常理一些...直接塞到 user 表里查虽然也不是不行但是...还是有点怪吧...
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

  async getUserLikes(
    username: string,
    noteQuery: NoteListQuery,
    user: UserModel,
  ) {
    const { pageCurrent, pageSize } = noteQuery

    // 从 user 下找到点赞列表
    const _user = await this.userModel
      .findOne({ username })
      .select('like_note_ids')
    const _likeNoteIds = _user.like_note_ids

    const noteList = await this.noteModel
      .find({ _id: { $in: _likeNoteIds } })
      .sort({ created_at: -1 })
      .skip((pageCurrent - 1) * pageSize)
      .limit(pageSize)
      .populate('author tags')
      .lean()

    if (user?._id) {
      const _c_user = await this.userModel
        .findById(user._id)
        .select('like_note_ids')
      const _c_likeNoteIds = _c_user.like_note_ids
      noteList.forEach((i) => {
        i['is_liked'] = _c_likeNoteIds.includes(i._id)
      })
    }
    return noteList
  }

  get model() {
    return this.noteModel
  }
}
