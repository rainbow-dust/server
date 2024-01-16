// https://docs.nestjs.com/security/authentication
// https://docs.nestjs.com/recipes/passport
/* 

嗯...我对 nest 的了解不够，而一开始复制来的代码又有很大问题...
第一次是 authCode 等信息没被放进 payload 导致一直根本找不到 user
第二次是 @CurrentUser 在没有 auth 的情况下一直都是 null。 这个是我想让一个接口在有没有 auth 的情况下都能访问但可以有不同的表现。
我试了很多...但经常出现我看不懂的报错...循环依赖...数据库连接未建立什么的... 我大概能想到这和 nest 的模块化和依赖注入，实例化时机有关，但目前不知道怎么解决。原本代码也有很多根本是没有执行的，删掉了。

最后的方案是把 _id 也放进 payload 里，然后在 current-user.decorator 这里，在没有 user 有 token 的时候再解码一遍... 也算能用吧...
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
