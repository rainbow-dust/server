import {
  CanActivate,
  ExecutionContext,
  UseGuards,
  applyDecorators,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard as _AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'

// import { AuthGuard } from '../guard/auth.guard'
// 我真的会谢... 上面引入的这个 AuthGuard tmd 根本不起作用.. request.user 一直是 undefined, 不论成功还是失败... 我不知道当初是不是有个版本这代码是起作用的，但现在升级之后...它根本不会走里面那个分支而是直接调用的默认的原本的方法...像下面这样我现在这样直接引入, 效果也是一样的
// 反正最新版的文档是在这一步就需要自己把 token 解码然后把信息加到 request 上... 真tmd离谱啊都...乱七八糟
// ...😭😭😭 为什么这样啊
class AuthGuard extends _AuthGuard('jwt') {}

class InfoGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    console.log('reqqq', request.headers.authorization)
    return true
  }
}

export function Auth() {
  const decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[] =
    []
  decorators.push(UseGuards(AuthGuard))
  decorators.push(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  )
  return applyDecorators(...decorators)
}

export function AuthInfo() {
  const decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[] =
    []
  decorators.push(UseGuards(InfoGuard))
  decorators.push(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  )
  return applyDecorators(...decorators)
}
