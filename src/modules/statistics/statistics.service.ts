import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'

import { NoteModel } from '../note/note.model'
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
  ) {}

  // 嗯....和我最初的想法不太一样了，本以为统计可以直接把数据算好放数据库里等着查，但是似乎，没法应对那么多变动个的需求。
  // 是要写成一些服务的，有种数据设计的需要是
  /* 
    xAxis: time ranges
    yAxis: detail data
    x,y 都是数组，长度相同，x[i] 与 y[i] 对应。

    针对这种数据，我们需要储存的是一个数组，数组的每个元素是一个对象，对象的属性有两个，一个是时间范围，一个是数据。...好像还是依旧弄好数据等着查...通过定时任务来生成这些就好...然后查询是另一回事，默认每次给最新的一条或几条。

    就是这些目前都被你放进了一个表里，感觉这样嵌套好深...
  */

  // 这个是一个定时任务的测试，每分钟的第5秒执行一次
  @Cron('5 * * * * *')
  handleCron() {
    console.log('Called when the current second is 5')
  }

  // 有些别的我也想用定时任务做算了...
  // 比如用户的被点赞数，被收藏数，发布的文章数...因为即使是我现在这样塞来塞去关联的话也不太好更新，还可能有问题...
  // 每一小时的第5分钟执行一次
  // @Cron('5 0 * * * *')

  // 这个是一个定时任务的测试，每分钟的第5秒执行一次
  // 其实还有一件事，就是，我不知道怎么统计时段内的点赞数量，所以需要不断地查询，然后计算差值来得到这个数据。
  // 也该设计设计了。写一个大的定时任务也不是不行。
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
}
