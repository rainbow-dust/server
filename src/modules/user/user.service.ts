import { compareSync, hashSync } from 'bcrypt'
import { Model } from 'mongoose'
import { nanoid } from 'nanoid'

import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UserModel } from '~/modules/user/user.model'
import { sleep } from '~/utils/tool.util'

import { UserDetailDto, UserDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectModel('UserModel')
    private readonly userModel: Model<UserModel>,
  ) {}
  async createUser(user: UserDto) {
    const hasMaster = !!(await this.userModel.count())

    if (!hasMaster) {
      // 如果是第一个用户，那么就是主人，会有一个特殊权限，但...也无所谓
    }

    // 检测是否有重名
    const hasUser = await this.userModel.findOne({ username: user.username })
    if (hasUser) {
      throw new ForbiddenException('用户名已存在')
    }
    user.password = hashSync(user.password, 7)
    const authCode = nanoid(10)

    const res = await this.userModel.create({
      ...user,
      admin: !hasMaster,
      authCode,
    })
    return { username: res.username, authCode: res.authCode, admin: res.admin }
  }

  async login(username: string, password: string) {
    const user = await this.userModel
      .findOne({ username })
      .select(['+password', '+authCode'])
    if (!user) {
      await sleep(1000)
      throw new ForbiddenException('用户名不正确')
    }
    if (!compareSync(password, user.password)) {
      await sleep(1000)
      throw new ForbiddenException('密码不正确')
    }
    return user
  }

  async patchUserData(data: UserDetailDto, currentUser: UserModel) {
    const _user = await this.userModel.findById(currentUser._id)
    // if (!_user?.admin && data._id != _user._id) {
    //   throw new ForbiddenException('无修改权限')
    // }
    // 我是觉得...直接修改 currentUser 的就好，直接使用这里的id去改也可以防止修改别人信息。data 里再传一个 _id ...好像并不能有更多的安全性
    if (!_user) {
      throw new ForbiddenException('用户不存在')
    }
    if (data?.password) {
      data.password = hashSync(data.password, 7)
      data['authCode'] = nanoid(10)
      return this.userModel.updateOne({ _id: _user._id }, data)
    }
    return this.userModel.updateOne({ _id: _user._id }, data)
  }

  async getUserInfo(username: string, currentUser?: UserModel) {
    const _user = await this.userModel.findOne({ username })
    if (!_user) {
      throw new ForbiddenException('用户不存在')
    }
    console.log(currentUser)
    if (currentUser?._id) {
      _user['is_followed'] = !!_user?.followers?.find(
        (follower) => follower === currentUser._id,
      )
    }
    return _user
  }

  async follow(mentionee: string, user: UserModel) {
    const _mentionee = await this.userModel.findOne({ username: mentionee })
    if (!_mentionee) {
      throw new ForbiddenException('被关注者不存在')
    }
    const _user = await this.userModel.findById(user._id)
    if (!_user) {
      throw new ForbiddenException('关注者不存在')
    }
    const hasFollowed = await this.userModel.findOne({
      _id: _user._id,
      followees: _mentionee._id,
    })
    if (hasFollowed) {
      throw new ForbiddenException('已关注')
    }

    const op1 = this.userModel.updateOne(
      { _id: _user._id },
      { $push: { followees: _mentionee._id } },
    )
    const op2 = this.userModel.updateOne(
      { _id: _mentionee._id },
      { $push: { followers: _user._id } },
    )
    return Promise.all([op1, op2])
  }

  async cancelFollow(mentionee: string, user: UserModel) {
    const _mentionee = await this.userModel.findOne({ username: mentionee })
    if (!_mentionee) {
      throw new ForbiddenException('被关注者不存在')
    }
    const _user = await this.userModel.findById(user._id)
    if (!_user) {
      throw new ForbiddenException('关注者不存在')
    }
    const hasFollowed = await this.userModel.findOne({
      _id: _user._id,
      followees: _mentionee._id,
    })
    if (!hasFollowed) {
      throw new ForbiddenException('未关注')
    }
    const op1 = this.userModel.updateOne(
      { _id: _user._id },
      { $pull: { followees: _mentionee._id } },
    )
    const op2 = this.userModel.updateOne(
      { _id: _mentionee._id },
      { $pull: { followers: _user._id } },
    )
    return Promise.all([op1, op2])
  }

  get model() {
    return this.userModel
  }
}
