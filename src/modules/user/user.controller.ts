import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'

import { AuthService } from '../auth/auth.service'
import { UserDetailDto, UserDto } from './user.dto'
import { UserModel } from './user.model'
import { UserService } from './user.service'

@Controller('user')
@ApiName
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: '注册' })
  async register(@Body() userDto: UserDto) {
    await this.userService.createUser(userDto)
    return
  }

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @HttpCode(200)
  async login(@Body() dto: UserDto) {
    const user = await this.userService.login(dto.username, dto.password)
    const { username } = user
    return {
      username,
      token: await this.authService.signToken(user.id.toString()),
    }
  }

  @Patch()
  @Auth()
  async patchUserData(
    @Body() body: UserDetailDto,
    @CurrentUser() user: UserModel,
  ) {
    return await this.userService.patchUserData(body, user)
  }

  @Put()
  @Auth()
  async putUserData(
    @Body() body: UserDetailDto,
    @CurrentUser() user: UserModel,
  ) {
    return await this.userService.patchUserData(body, user)
  }

  @Get('check_logged')
  @ApiOperation({ summary: '判断当前 Token 是否有效 ' })
  @Auth()
  checkLogged(@CurrentUser() user: UserModel) {
    return this.userService.model.findOne({ username: user.username })
  }

  @Get('/:username')
  @ApiOperation({ summary: '获取指定用户名的信息' })
  getUserInfo(@Param('username') username: string) {
    return this.userService.model.findOne({ username })
  }

  @Post('follow/:mentionee')
  @ApiOperation({ summary: '关注' })
  @Auth()
  async follow(@Param('mentionee') mentionee: string, @CurrentUser() user) {
    return this.userService.follow(mentionee, user)
  }

  @Post('unfollow/:mentionee')
  @ApiOperation({ summary: '取消关注' })
  @Auth()
  async unfollow(@Param('mentionee') mentionee: string, @CurrentUser() user) {
    return this.userService.unfollow(mentionee, user)
  }

  // 如果你是把数据直接塞进了 user 里的话...是不是直接就能拿到...
  // @Get('following/:username')
  // @ApiOperation({ summary: '获取指定用户的关注列表' })
  // async getFollowing(@Param('username') username: string) {
  //   return this.userService.getFollowing(username)
  // }

  // @Get('follower/:username')
  // @ApiOperation({ summary: '获取指定用户的被关注列表' })
  // async getFollower(@Param('username') username: string) {
  //   return this.userService.getFollower(username)
  // }
}
