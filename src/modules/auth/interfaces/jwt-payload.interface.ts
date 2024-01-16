export interface JwtPayload {
  authCode: string
  _id: string
  iat: number
  exp: number
}
