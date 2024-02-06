import { Controller } from '@nestjs/common'

// import { Auth } from '~/common/decorator/auth.decorator'
// import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'

// import { UserModel } from '../user/user.model'
// import { StatisticsDto } from './statistics.dto'
import { StatisticsService } from './statistics.service'

@Controller('statistics')
@ApiName
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
}
