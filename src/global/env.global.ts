import 'dotenv/config'

import { argv } from 'zx-cjs'

export const isDev = process.env.NODE_ENV == 'development'
export const cwd = process.cwd()

export const QINIU_SECRET = {
  qn_host: process.env.QN_HOST || argv.qn_host,
  qn_scope: process.env.QN_SCOPE || argv.qn_scope,
  qn_ak: process.env.QN_AK || argv.qn_ak,
  qn_sk: process.env.QN_SK || argv.qn_sk,
}
console.log(QINIU_SECRET)
