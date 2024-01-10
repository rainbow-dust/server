import { Controller } from '@nestjs/common'

import { ApiName } from '~/common/decorator/openapi.decorator'

import { TagService } from './tag.service'

@Controller('tag')
@ApiName
export class TagController {
  constructor(private readonly tagService: TagService) {}
}
