import { Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import PKG from '../package.json'

@Controller()
@ApiTags('Root')
export class AppController {
  @Get(['/', '/info'])
  async appInfo() {
    return {
      name: PKG.name,
      author: PKG.author,
      version: PKG.version,
      // homepage: PKG.homepage,
      // issues: PKG.issues,
    }
  }

  @Post('/ping')
  ping(): 'pong' {
    return 'pong'
  }
}
