import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'

// import { UserModel } from '../user/user.model'
// import { StatisticsDto } from './statistics.dto'
import { StatisticActionsModel, StatisticsModel } from './statistics.model'

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel('StatisticsModel')
    private readonly statisticsModel: Model<StatisticsModel>,
    @InjectModel('StatisticActionsModel')
    private readonly statisticActionsModel: Model<StatisticActionsModel>,
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
}
