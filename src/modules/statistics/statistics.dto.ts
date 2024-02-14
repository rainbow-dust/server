import { IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class StatisticsDto {
  @ApiProperty({ description: '统计动作' })
  @IsString()
  action: string

  @ApiProperty({ description: '统计目标' })
  @IsString()
  target: string

  @ApiProperty({ description: '统计值' })
  @IsString()
  value: string
}
