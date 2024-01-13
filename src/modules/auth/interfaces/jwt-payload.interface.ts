export interface JwtPayload {
  authCode: string
  iat: number
  exp: number
}
