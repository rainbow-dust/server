import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'

import { MongoIdDto } from '../..//shared/dto/id.dto'
import { UserModel } from '../user/user.model'
import { PostDto, PostList } from './post.dto'
import { PartialPostModel } from './post.model'
import { PostService } from './post.service'

@Controller('post')
@ApiName
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/add')
  @Auth()
  async create(@Body() post: PostDto, @CurrentUser() user: UserModel) {
    return await this.postService.create(post, user)
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 id 查文章' })
  async findLostById(@Param('id') id: string) {
    return this.postService.findPostById(id)
  }

  @Post('/query/list')
  @ApiOperation({ summary: '分页获取博文' })
  async getPaginate(@Body() postList: PostList) {
    return this.postService.postPaginate(postList)
  }

  @Delete(':id')
  @Auth()
  async deletePost(@Param('id') id: string, @CurrentUser() user: UserModel) {
    const _post = await this.postService.model.findById(id)
    if (_post?.user !== user._id && !user.admin) {
      throw new ForbiddenException('没有权限删除')
    }
    return await this.postService.deletePost(id)
  }

  @Patch('/:id')
  @Auth()
  async patch(
    @Param() params: MongoIdDto,
    @Body() body: PartialPostModel,
    @CurrentUser() user: UserModel,
  ) {
    const _post = await this.postService.model.findById(params.id)
    if (_post?.user !== user._id && !user.admin) {
      throw new ForbiddenException('没有权限修改')
    }
    return await this.postService.updateById(params.id, body)
  }

  @Put('/:id')
  @Auth()
  async put(
    @Param() params: MongoIdDto,
    @Body() body: PartialPostModel,
    @CurrentUser() user: UserModel,
  ) {
    const _post = await this.postService.model.findById(params.id)
    if (_post?.user !== user._id && !user.admin) {
      throw new ForbiddenException('没有权限修改')
    }
    return await this.postService.updateById(params.id, body)
  }

  // 怎么说呢...这里应该..换种设计
  // 列表查询的时候，如果有auth，就同时也给个isLike的字段
  // 然后不管怎么点，就是同一个接口，发现已经点过了，就unlike，没点过就like，然后返回结果到前端
  @Post('/like/:id')
  @Auth()
  async like(@Param('id') id: string, @CurrentUser() user: UserModel) {
    return await this.postService.like(id, user)
  }

  @Post('/unlike/:id')
  @Auth()
  async unlike(@Param('id') id: string, @CurrentUser() user: UserModel) {
    return await this.postService.unlike(id, user)
  }
}
