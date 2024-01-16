import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard as _AuthGuard } from '@nestjs/passport'

/**
 * JWT auth guard
 */

@Injectable()
export class AuthGuard extends _AuthGuard('jwt') implements CanActivate {
  override async canActivate(context: ExecutionContext): Promise<any> {
    return super.canActivate(context)
  }
}
