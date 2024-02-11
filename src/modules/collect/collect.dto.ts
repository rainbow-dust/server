import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class CollectModifyDto {
  @ApiProperty({ required: true })
  @IsString({ message: '收藏名' })
  name: string

  @ApiProperty({})
  @IsString({ message: '收藏描述' })
  @IsOptional()
  desc: string

  @IsBoolean({ message: '是否公开' })
  @IsOptional()
  is_public: boolean

  @IsString({ message: '收藏夹id' })
  @IsOptional()
  _id: string
}
