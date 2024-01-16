import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { getNestExecutionContextRequest } from '~/transformers/get-req.transformer'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const _context = getNestExecutionContextRequest(ctx)
    const _authToken =
      _context.header.authorization || _context.header('authorization')
    if (!_context.user && _authToken) {
      const token = _authToken.split(' ')[1]
      const jwtService = new JwtService({})
      const _payload = jwtService.decode(token)
      _context.user = {
        _id: _payload._id,
        authCode: _payload.authCode,
      }
    }
    return _context.user
  },
)
