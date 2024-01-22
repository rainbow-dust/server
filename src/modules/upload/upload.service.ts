import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

import { Injectable, InternalServerErrorException } from '@nestjs/common'

@Injectable()
export class UploadService {
  async uploadPhoto(file: Express.Multer.File) {
    const uploadDir = path.join(__dirname, '../../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }

    const extname = path.extname(file.originalname)
    const filename = `${file.originalname
      .replace(extname, '')
      .toLowerCase()
      .split(' ')
      .join('_')}-${Date.now()}${extname}`
    const filepath = path.join(uploadDir, filename)

    try {
      await fs.promises.writeFile(filepath, file.buffer)
      return {
        url: url.resolve('', `/uploads/${filename}`),
      }
    } catch (error) {
      throw new InternalServerErrorException('上传失败')
    }
  }
}
