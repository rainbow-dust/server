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
        user: _user ? _user._id : baseInfo.username,
        device: baseInfo.device,
        time_stamp: item.time_stamp,
        page_url: item.page_url,
        type: item.type,
        action: item.action,
        extra_data_for_event: item.data,
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

  async getStatisticActions(dto) {
    const { pageCurrent, pageSize, ...query } = dto
    const totalCount = await this.statisticActionsModel.countDocuments(query)
    const list = await this.statisticActionsModel
      .find(query)
      .sort({ _id: -1 })
      .skip((pageCurrent - 1) * pageSize)
      .limit(pageSize)
    return {
      list,
      totalCount,
    }
  }

  async getPopularAuthor() {
    const data = await this.statisticsModel
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .populate('popular_authors', 'user')
    //  populate 没效果... 可能我还是对这些工具期待太多了吧...
    const _user_ids = data[0].popular_authors.map((item) => item.user)
    const _users = await this.userModel
      .find(
        { _id: { $in: _user_ids } },
        'username be_liked_count note_count read_count',
      )
      .then((res) => {
        return res.map((item) => {
          return {
            _id: item._id,
            user: item.username,
            like_count: item.be_liked_count,
            note_count: item.note_count,
          }
        })
      })

    const __users = data[0].popular_authors.map((item) => {
      return {
        user: _users.find(
          (user) => user._id.toString() === item.user.toString(),
        ),
        like_count: item.like_count,
        note_count: item.note_count,
      }
    })

    return { list: __users }
  }

  async getPopularNote() {
    const data = await this.statisticsModel.find({}).sort({ _id: -1 }).limit(1)
    const _note_ids = data[0].popular_notes.map((item) => item.note)
    const _notes = await this.noteModel.find({ _id: { $in: _note_ids } })

    const __notes = data[0].popular_notes.map((item) => {
      return {
        note: _notes.find(
          (note) => note._id.toString() === item.note.toString(),
        ),
        like_count: item.like_count,
        collect_count: item.collect_count,
      }
    })
    return { list: __notes }
  }

  async getPopularTag() {
    const data = await this.statisticsModel.find({}).sort({ _id: -1 }).limit(1)
    return { list: data[0].popular_tags }
  }
  /* 
    至于饼图...也许标签分类可以做出一些
    如果能拿到 ip 地址,也许还能做出一些地域分布图

    目前似乎...也就这些了
  */

  /* 
    下面是一些定时任务
  */

  @Cron('0 0 */2 * * *')
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

  // @Cron('5 * * * * *')
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

    const _requests = await this.statisticActionsModel.find({ type: 'request' })
    // 通过 extra_data_for_event.url 分组
    const _requests_grouped = _requests.reduce((prev, item) => {
      if (prev[item.extra_data_for_event.url]) {
        prev[item.extra_data_for_event.url]++
      } else {
        prev[item.extra_data_for_event.url] = 1
      }
      return prev
    }, {})
    console.log(_requests_grouped)
    // 嗯...常理来说 popular_xxx 应该是计算一段时间内的增量来搞的，记录的数据也应该是一段时间内的...但是...
    // 这边的代码想搞真实有效的数据还是太费劲也太费时间了...
    const popular_requests = Object.keys(_requests_grouped).map((key) => {
      return {
        url: key,
        count: _requests_grouped[key],
      }
    })
    const popular_notes = await this.noteModel
      .find({}, '_id like_count read_count collect_count')
      .sort({ like_count: -1 })
      .limit(10)
      .then((res) => {
        return res.map((item) => {
          return {
            note: item._id,
            like_count: item.like_count,
            read_count: item.read_count,
            collect_count: item.collect_count,
          }
        })
      })
    const popular_authors = await this.userModel
      .find({}, '_id be_liked_count note_count')
      .sort({ be_liked_count: -1 })
      .limit(10)
      .then((res) => {
        return res.map((item) => {
          return {
            user: item._id,
            like_count: item.be_liked_count,
            note_count: item.note_count,
          }
        })
      })
    const popular_tags = await this.tagModel
      .find({}, '_id heat reference_count')
      .sort({ heat: -1 })
      .limit(10)
      .then((res) => {
        return res.map((item) => {
          return {
            tag: item._id,
            heat: item.heat,
            reference_count: item.reference_count,
          }
        })
      })
    const newStatistics = new this.statisticsModel({
      total_user_count: await this.userModel.countDocuments(),
      total_note_count: await this.noteModel.countDocuments(),
      total_note_like_count: _note_detail_count.like_count,
      total_note_read_count: _note_detail_count.read_count,
      total_request_count: _requests.length,
      popular_requests,
      popular_notes,
      popular_authors,
      popular_tags,
    })
    await newStatistics.save()
  }
}
