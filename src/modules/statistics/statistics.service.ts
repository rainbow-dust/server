import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'

import { CommentModel } from '../comment/comment.model'
import { NoteModel } from '../note/note.model'
import { TagModel } from '../tag/tag.model'
import { UserModel } from '../user/user.model'
// import { StatisticsDto } from './statistics.dto'
import { StatisticActionsModel, StatisticsModel } from './statistics.model'

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel('StatisticsModel')
    private readonly statisticsModel: Model<StatisticsModel>,
    @InjectModel('StatisticActionsModel')
    private readonly statisticActionsModel: Model<StatisticActionsModel>,
    @InjectModel('UserModel')
    private readonly userModel: Model<UserModel>,
    @InjectModel('NoteModel')
    private readonly noteModel: Model<NoteModel>,
    @InjectModel('TagModel')
    private readonly tagModel: Model<TagModel>,
    @InjectModel('CommentModel')
    private readonly commentModel: Model<CommentModel>,
  ) {}

  /* 
    折线图,需要的数据结构通常如下:
    xAxis: time ranges
    yAxis: detail data
    x,y 都是数组，长度相同，x[i] 与 y[i] 对应。

    想法是,每次统计,数据库里存的的是一个时刻的绝对数据,而需要查询的时候,根据参数,对总量两两求差或者说求导,就能得到这个时间段内的变化量。
  */

  /* 
    至于饼图...也许标签分类可以做出一些
    如果能拿到 ip 地址,也许还能做出一些地域分布图

    目前似乎...也就这些了
  */

  @Cron('5 * * * * *')
  updateBasicUserStatistics() {
    // 先查到所有的用户
    this.userModel.find({}, '_id').then((users) => {
      users.forEach((user) => {
        // 查到所有的文章
        this.noteModel
          .find({ author: user._id }, '_id like_count collect_count')
          .then((notes) => {
            // 查文章的 like 和 collect 的 count
            const likeCount = notes.reduce((prev, note) => {
              return prev + (note.like_count || 0)
            }, 0)
            const collectCount = notes.reduce((prev, note) => {
              return prev + (note.collect_count || 0)
            }, 0)

            // 更新用户的统计数据
            this.userModel.updateOne(
              { _id: user._id },
              {
                be_liked_count: likeCount,
                be_collected_count: collectCount,
                note_count: notes.length,
              },
            )
          })
      })
    })
  }

  @Cron('5 * * * * *')
  async updateTagHeat() {
    const tags = await this.tagModel.find({}, '_id')
    for (const tag of tags) {
      const notes = await this.noteModel.find(
        { tags: tag._id },
        '_id like_count collect_count',
      )
      const heat = notes.reduce((prev, note) => {
        // 之后考虑加个权
        return (
          prev +
          (note.like_count || 0) +
          (note.collect_count || 0) +
          (note.comment_count || 0) +
          (note.read_count || 0)
        )
      }, 0)
      const reference_count = notes.length
      await this.tagModel.updateOne(
        { _id: tag._id },
        {
          heat,
          reference_count,
        },
      )
    }
  }

  @Cron('5 * * * * *')
  async statisticsUpdate() {
    // 不对，这样做的话..是不是要存的只是切片而已。？
    // 查询的时候，是不是要把所有的切片都查出来，然后再算差值？
    // 对。

    const _note_detail_count = await this.noteModel
      .aggregate([
        {
          $group: {
            _id: null,
            like_count: { $sum: '$like_count' },
            read_count: { $sum: '$read_count' },
          },
        },
      ])
      .then((res) => {
        return res[0]
      })
    const newStatistics = new this.statisticsModel({
      // 有些...挺大的问题。现在这样怎么把热门作者，热门文章，热门标签统计出来？
      // 点赞没有单独建表...许多数据是没有的...
      // 我现在又想到一个,点赞表是点赞表,文章里存的是文章里存的. 这 tmd 是两回事... 是可以全都要的.

      // 不过捏数据这块倒也不难受,点赞信息没了,可文章发布可是有时间的,按发布的时间晒一遍派排序就好了. 不会一点依据都没有.
      // 作者也是一样

      total_user_count: await this.userModel.countDocuments(),
      total_note_count: await this.noteModel.countDocuments(),
      total_note_like_count: _note_detail_count.like_count,
      total_note_read_count: _note_detail_count.read_count,
    })
    await newStatistics.save()
  }
}
