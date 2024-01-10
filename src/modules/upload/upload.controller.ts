import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger'

import { ApiName } from '~/common/decorator/openapi.decorator'

import { UploadService } from './upload.service'

class FileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any
}

@Controller('upload')
@ApiName
export class UploadController {
  constructor(private readonly UploadService: UploadService) {}

  @Post('album')
  @ApiOperation({ summary: '图片上传' })
  @ApiBody({
    description: '图片上传',
    type: FileDto,
  })
  @ApiConsumes('multipart/form-data')
  // @Auth() // 权限校验
  @UseInterceptors(FileInterceptor('file')) // 处理文件中间件 file 与上传的字段对应
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.UploadService.uploadPhoto(file)
  }
}
