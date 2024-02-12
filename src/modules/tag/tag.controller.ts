import { Body, Controller, HttpCode, Param, Post, Query } from '@nestjs/common'

import { ApiName } from '~/common/decorator/openapi.decorator'

import { CreateTagDto } from './tag.dto'
import { TagService } from './tag.service'

@Controller('tag')
@ApiName
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('/add')
  async add(@Body() tag: CreateTagDto) {
    return this.tagService.create(tag)
  }

  @Post('/query')
  @HttpCode(200)
  async query(@Query('query_str') query: string) {
    return this.tagService.query(query)
  }

  @Post('/query/:tagName')
  @HttpCode(200)
  async queryDetail(@Param('tagName') name: string) {
    return this.tagService.queryDetail(name)
  }
}
