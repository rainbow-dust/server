// https://docs.nestjs.com/security/authentication
/* 

是，原版的那个东西是不需要支持多用户的... 评论功能要关联用户了甚至用 body 参数去做... md 这不离谱吗..
payload 的 payload { iat: 1705133263, exp: 1705738063 } 

iss ：签发人
exp ：过期时间
sub ：主题
aud ：受众
nbf ：生效时间
iat ：签发时间
jti ：编号

就是说这里的 payload 被处理过了...为什么只剩了两个... 
加上...
*/

import { machineIdSync } from 'node-machine-id'

import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { SECURITY } from '~/app.config'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

const getMachineId = () => {
  const id = machineIdSync()
  return id
}
export const __secret: any =
  SECURITY.jwtSecret ||
  Buffer.from(getMachineId()).toString('base64').slice(0, 15) ||
  'konodiodadadadada'

const jwtModule = JwtModule.registerAsync({
  useFactory() {
    return {
      secret: __secret,
      signOptions: {
        expiresIn: SECURITY.jwtExpire,
        algorithm: 'HS256',
      },
    }
  },
})
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [PassportModule, jwtModule],
  exports: [JwtStrategy, AuthService, jwtModule],
})
export class AuthModule {}
