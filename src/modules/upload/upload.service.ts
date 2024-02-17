import qiniu from 'qiniu'
import * as url from 'url'

import { Injectable, InternalServerErrorException } from '@nestjs/common'

import { QINIU_SECRET } from '~/global/env.global'

@Injectable()
export class UploadService {
  async uploadPhoto(file: Express.Multer.File) {
    const mac = new qiniu.auth.digest.Mac(
      QINIU_SECRET.qn_ak,
      QINIU_SECRET.qn_sk,
    )
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: QINIU_SECRET.qn_scope,
    })
    const uploadToken = putPolicy.uploadToken(mac)

    // upload
    const formUploader = new qiniu.form_up.FormUploader(
      new qiniu.conf.Config({
        zone: qiniu.zone.Zone_z1,
      }),
    )
    const img = (await new Promise((_res, _rej) => {
      formUploader.put(
        uploadToken,
        `${Date.now()}-${file.originalname}`,
        file.buffer,
        new qiniu.form_up.PutExtra(),
        (respErr, respBody, respInfo) => {
          if (respErr) {
            console.error(respErr)
            throw new InternalServerErrorException(respErr.message)
          }

          if (respInfo.statusCode == 200) {
            _res({
              url: new url.URL(respBody.key, QINIU_SECRET.qn_host).href,
            })
          } else {
            console.error(respInfo.statusCode, respBody)
            throw new InternalServerErrorException(respInfo)
          }
        },
      )
    })) as { url: string }

    // https 目前不可访问...
    const http_url = img.url.replace('https', 'http')
    return { url: http_url }
  }
}
