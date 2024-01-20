import { InternalServerErrorException } from '@nestjs/common'

export class AuthFailedException extends InternalServerErrorException {
  constructor() {
    super('系统异常，授权失败')
  }
}
