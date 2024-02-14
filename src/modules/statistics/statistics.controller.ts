import { Body, Controller, Post } from '@nestjs/common'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'
import { UserModel } from '~/modules/user/user.model'

import { StatisticsDto } from './statistics.dto'
import { StatisticsService } from './statistics.service'

@Controller('statistics')
@ApiName
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /* 
    接口设计部分, 也是考虑两大块,
    一部分是收集数据, 主要与 statistics_actions 这个 model 相关, 往里面填数据
    另一部分是提供处理后的数据, 主要与 statistics 这个 model 相关, 这个 model 会依赖全局数据 当然也包括 statistics_actions 里收集的, 涉及一些计算.

    1.1 collect

    2.1 getDataOverview
    2.2 getPopularAuthors/Notes/Tags
    2.3 getGroupedStatistics ByTimeRange ByTag ...
    2.4 getStatisticActions
  */
  @Auth()
  @Post('/collect')
  async collect(@CurrentUser() user: UserModel, @Body() dto: StatisticsDto) {
    return this.statisticsService.collect(user, dto)
  }

  // @Auth()
  @Post('/data-overview')
  async getDataOverview() {
    return await this.statisticsService.getDataOverview()
  }
}
