import { argv } from 'zx-cjs'

export const PORT = 9527
export const API_VERSION = 1

export const CROSS_DOMAIN = {
  allowedOrigins: ['huamurui.me', 'localhost', '127.0.0.1', '.*dev'],
}

export const MONGO_DB = {
  dbName: 'furina',
  host: argv.db_host || '127.0.0.1',
  port: 27017,
  get uri() {
    return `mongodb://${this.host}:${this.port}/${this.dbName}`
  },
}

export const AXIOS_CONFIG = {
  timeout: 10000,
}

export const SECURITY = {
  jwtSecret: 'furina',
  jwtExpire: 60 * 60 * 24 * 7,
}
