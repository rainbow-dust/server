import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'

import { AuthFailedException } from '~/common/exceptions/auth-failed.exception'
import { UserModel } from '~/modules/user/user.model'

import { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('UserModel')
    private readonly userModel: Model<UserModel>,
    private readonly jwtService: JwtService,
  ) {}

  async signToken(openid: string) {
    const user = await this.userModel.findById(openid, { authCode: 1 })
    if (!user) {
      throw new AuthFailedException()
    }
    const authCode = user.authCode
    const payload = {
      authCode,
      _id: openid,
    }
    return this.jwtService.signAsync(payload)
  }

  async verifyPayload(payload: JwtPayload) {
    const user = await this.userModel.findOne(
      {
        authCode: payload.authCode,
      },
      { authCode: 1 },
    )
    if (!user) {
      throw new AuthFailedException()
    }
    return user && user.authCode === payload.authCode ? user : null
  }
}
