import { Controller } from '@nestjs/common'

import { ApiName } from '~/common/decorator/openapi.decorator'

import { TagService } from './tag.service'

@Controller('tag')
@ApiName
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // tag 这里... 应该是搜索查询很频繁的。
}
