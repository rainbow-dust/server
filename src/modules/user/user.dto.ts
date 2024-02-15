import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class UserDto {
  @ApiProperty({ required: true })
  @IsString({ message: '用户名' })
  @IsOptional()
  username: string

  @ApiProperty({ required: true })
  @IsString({ message: '密码' })
  @IsOptional()
  password: string

  @IsString({ message: '介绍' })
  @IsOptional()
  bio: string

  @IsString({ message: '头像' })
  @IsOptional()
  avatar_url: string

  @IsString({ message: '封面' })
  @IsOptional()
  cover_url: string
}

export class UserDetailDto extends UserDto {
  @IsOptional()
  @IsBoolean()
  admin?: boolean

  @IsOptional()
  _id: string
}
