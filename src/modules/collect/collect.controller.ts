import { Body, Controller, Post } from '@nestjs/common'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'

import { UserModel } from '../user/user.model'
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
    console.log('collect', collect, user)
    return this.collectService.create(collect, user)
  }

  // 查询收藏夹们 by user...要 auth
  @Post('query/list')
  @Auth()
  async queryCollectList(@CurrentUser() user: UserModel) {
    return this.collectService.queryList(user)
  }

  // 查询一个收藏夹的详情
  @Post('query/detail')
  @Auth()
  async queryCollectDetail(
    @Body('collectId') collectId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.queryDetail(collectId, user)
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
    @Body('noteId') noteId: string,
    @Body('collectId') collectId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.addNoteToCollect(noteId, collectId, user)
  }

  // 取消收藏文章
  @Post(':id/remove')
  @Auth()
  async removeNoteFromCollect(
    @Body('noteId') noteId: string,
    @Body('collectId') collectId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.collectService.removeNoteFromCollect(noteId, collectId, user)
  }
}
