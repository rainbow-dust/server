import { compareSync, hashSync } from 'bcrypt'
import { Model, Types } from 'mongoose'
import { nanoid } from 'nanoid'

import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UserModel } from '~/modules/user/user.model'

import { NoticeService } from '../notice/notice.service'
import { UserDetailDto, UserDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectModel('UserModel')
    private readonly userModel: Model<UserModel>,
    private readonly noticeService: NoticeService,
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
      throw new ForbiddenException('用户名不存在')
    }
    if (!compareSync(password, user.password)) {
      throw new ForbiddenException('用户名或密码错误')
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
    // string 和 ObjectId 不能直接比较，所以要把 string 转成 ObjectId

    //  currentUser?._id
    const _currentUser = new Types.ObjectId(currentUser?._id)

    const _user = await this.userModel
      .aggregate([
        {
          $match: { username },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'followers',
            foreignField: '_id',
            as: 'followers',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'followees',
            foreignField: '_id',
            as: 'followees',
          },
        },

        {
          $project: {
            username: 1,
            nickname: 1,
            avatar_url: 1,
            bio: 1,
            followers: {
              username: 1,
              nickname: 1,
              avatar_url: 1,
              _id: 1,
            },
            followees: {
              username: 1,
              nickname: 1,
              avatar_url: 1,
            },
            createdAt: 1,
            updatedAt: 1,
            be_liked_count: 1,
            be_collected_count: 1,
            note_count: 1,
          },
        },
        {
          $addFields: {
            is_following: {
              $in: [_currentUser, '$followers._id'],
            },
          },
        },
      ])
      // 不要包 data..
      .then((res) => res[0])
    if (!_user) {
      throw new ForbiddenException('用户还不存在哦')
    }
    // 做点好玩的，如果不是自己，就尝试，找一下CurrentUser的关注列表里有没有关注这个人的，形成一个数组
    if (currentUser?._id && currentUser?._id != _user._id) {
      const _currentUser = await this.userModel.findById(currentUser._id)
      // _user.followers 与 _currentUser.followees 的交集
      const intersection = _user.followers.filter((value) => {
        // return _currentUser.followees.includes(value._id) ... 该死的类型
        return _currentUser.followees.some(
          (v) => v.toString() === value._id.toString(),
        )
      })
      _user['mutual_follows'] = intersection
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
    await this.noticeService.createNotice({
      type: 'follow',
      topic: _mentionee._id,
      description: '关注了你',
      is_read: false,
      from: _user._id,
      to: _mentionee._id,
    })
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

  async queryUserList(queryUserListDto) {
    const { pageCurrent = 1, pageSize = 10, username } = queryUserListDto
    const query = {}
    if (username) {
      query['username'] = new RegExp(username)
    }
    const totalCount = await this.userModel.count(query)
    const list = await this.userModel
      .find(query)
      .skip((pageCurrent - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 })
    return { list, totalCount }
  }

  get model() {
    return this.userModel
  }
}
