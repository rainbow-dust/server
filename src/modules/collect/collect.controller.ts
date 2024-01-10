import { Controller } from '@nestjs/common'

import { ApiName } from '~/common/decorator/openapi.decorator'

import { CollectService } from './collect.service'

@Controller('collect')
@ApiName
export class CollectController {
  constructor(private readonly collectService: CollectService) {}
}
