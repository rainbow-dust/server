import { Body, Controller, HttpCode, Param, Post, Query } from '@nestjs/common'

import { Auth } from '~/common/decorator/auth.decorator'
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

  /* admin */
  @Post('/admin/query/list')
  @HttpCode(200)
  @Auth()
  async queryList(@Body() tagQueryListDto) {
    return this.tagService.queryList(tagQueryListDto)
  }

  @Post('/admin/edit/:name')
  @HttpCode(200)
  @Auth()
  async edit(@Param('name') name: string, @Body() tag: CreateTagDto) {
    return this.tagService.edit(name, tag)
  }
}
