import { ArrayUnique, IsOptional, IsString } from 'class-validator'

export class CreateTagDto {
  @IsString()
  name: string

  @IsString()
  description?: string
}

export class QueryTagsDto {
  @IsOptional()
  @ArrayUnique()
  tags: any[]
}
