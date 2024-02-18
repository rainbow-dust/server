import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'
import { UserModel } from '~/modules/user/user.model'

import { CollectModifyDto } from './collect.dto'
import { CollectService } from './collect.service'

@Controller('collect')
@ApiName
export class CollectController {
  constructor(private readonly collectService: CollectService) {}
  // 创建收藏夹
  @Post('create')
  @Auth()
  async createCollect(
    @Body() collect: CollectModifyDto,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.create(collect, user)
  }

  // 查询收藏夹们 by user...要 auth...?不行
  @Post('query/list')
  @HttpCode(200)
  async queryCollectList(
    @Body()
    collectListQueryDto: {
      username: string
      noteId?: string // 有这个参数就返回收藏夹内是否有这个文章
    },
  ) {
    return this.collectService.queryList(collectListQueryDto)
  }

  // 查询一个收藏夹的详情
  @Post('query/detail')
  @Auth()
  @HttpCode(200)
  async queryCollectDetail(
    @Body()
    collectDetailQueryDto: {
      collectId: string
      noteId?: string // 有这个参数就返回收藏夹内是否有这个文章
    },
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.queryDetail(collectDetailQueryDto, user)
  }

  // 修改收藏夹基本信息 by id
  @Post(':id/update')
  @Auth()
  async updateCollect(
    @Body() collect: CollectModifyDto,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.update(collect, user)
  }

  // 删除收藏夹
  @Post(':id/delete')
  @Auth()
  async deleteCollect(
    @Body('collectId') collectId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.delete(collectId, user)
  }

  // 收藏文章
  @Post(':id/add')
  @Auth()
  async addNoteToCollect(
    @Body() collectNoteDto: { noteId: string; collectId: string },
    @Param('id') collectId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.addNoteToCollect(collectNoteDto, collectId, user)
  }

  // 取消收藏文章
  @Post(':id/remove')
  @Auth()
  async removeNoteFromCollect(
    @Body() collectNoteDto: { noteId: string; collectId: string },
    @Param('id') collectId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.removeNoteFromCollect(
      collectNoteDto,
      collectId,
      user,
    )
  }
}
