import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'

import { CommentModel } from '~/modules/comment/comment.model'
import { NoteModel } from '~/modules/note/note.model'
import { TagModel } from '~/modules/tag/tag.model'
import { UserModel } from '~/modules/user/user.model'

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
    这里是数据收集
  */

  async collectUserAction(dtos) {
    const { baseInfo, events } = dtos
    const _user = await this.userModel.findOne({ username: baseInfo.username })
    const _statisticActions = events.map((item) => {
      return {
        patch_id: baseInfo.patch_id,
        user: _user._id,
        device: baseInfo.device,
        // time_stamp: new Date(item.time_stamp),
        page_url: item.page_url,
        type: item.type,
        action: item.action,
        data: item.data,
      }
    })
    await this.statisticActionsModel.insertMany(_statisticActions)
  }

  async collectRequest(req) {
    // 其实这一部分我有想直接在后端做掉的...但是 nest 我可能还是不太会。
    // 需要将 interceptor, global, modules 几个地方的东西都搞清楚...实在不行就也用前端做好了。
    console.log(req)
  }

  /* 
    这里是数据查询
    
    折线图,需要的数据结构通常如下:
    xAxis: time ranges
    yAxis: detail data
    x,y 都是数组，长度相同，x[i] 与 y[i] 对应。

    想法是,每次统计,数据库里存的的是一个时刻的绝对数据,而需要查询的时候,根据参数,对总量两两求差或者说求导,就能得到这个时间段内的变化量。
  */

  async getDataOverview() {
    // xAxis: string[];
    // data: Array<{ name: string; value: number[] }>;
    // 默认给出最近 12 条的差值
    // 找到  13 条数据,然后两两求差
    const data = await this.statisticsModel.find({}).sort({ _id: -1 }).limit(13)

    // x 是 created_at, y 是 total_user_count, total_note_count, total_note_like_count, total_note_read_count
    // 只找日吧
    const xAxis = data.map((item) => item.created_at.toISOString().slice(0, 10))
    const yAxis = data.map((item) => {
      return [
        item.total_user_count,
        item.total_note_count,
        item.total_note_like_count,
        item.total_note_read_count,
      ]
    })

    const names = [
      { name: '用户数', key: 'total_user_count' },
      { name: '文章数', key: 'total_note_count' },
      { name: '点赞数', key: 'total_note_like_count' },
      { name: '阅读数', key: 'total_note_read_count' },
    ]

    return {
      xAxis,
      data: names.map((item, index) => {
        const value = yAxis.map((item) => item[index])
        return {
          name: item.name,
          value,
        }
      }),
    }
  }

  /* 
    至于饼图...也许标签分类可以做出一些
    如果能拿到 ip 地址,也许还能做出一些地域分布图

    目前似乎...也就这些了
  */

  /* 
    下面是一些定时任务
  */

  @Cron('5 * * * * *')
  async updateBasicUserStatistics() {
    const users = await this.userModel.find({}, '_id')
    for (const user of users) {
      const notes = await this.noteModel.find(
        { author: user._id },
        '_id like_count collect_count',
      )
      const likeCount = notes.reduce((prev, note) => {
        return prev + (note.like_count || 0)
      }, 0)
      const collectCount = notes.reduce((prev, note) => {
        return prev + (note.collect_count || 0)
      }, 0)
      await this.userModel.updateOne(
        { _id: user._id },
        {
          be_liked_count: likeCount,
          be_collected_count: collectCount,
          note_count: notes.length,
        },
      )
    }
  }

  // @Cron('5 * * * * *')
  @Cron('0 0 */2 * * *')
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

  @Cron('0 0 */2 * * *')
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
