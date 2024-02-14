import {
  ArrayUnique,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

import { paginateDto } from '~/shared/dto/pager.dto'

import { Pic } from './note.model'

export enum Sort {
  Newest = 'newest',
  ThreeDaysHottest = 'three_days_hottest',
  WeeklyHottest = 'weekly_hottest',
  MonthlyHottest = 'monthly_hottest',
  Hottest = 'hottest',
}

export enum QueryType {
  user_preference = 'user_preference',
  tag_exact = 'tag_exact',
  user_note_exact = 'user_note_exact',
  ids_exact = 'ids_exact',
}

export class NoteDto {
  @IsString({ message: '标题' })
  title: string

  @IsString({ message: '文章内容' })
  content: string

  @IsOptional()
  @IsUrl()
  cover?: string

  @ArrayUnique()
  tags?: string[]

  @IsOptional()
  @ArrayUnique()
  pic_list?: Pic[]
}

export class NoteListQuery extends paginateDto {
  @ArrayUnique()
  @IsOptional()
  tags?: string[]

  @IsEnum(Sort)
  @IsOptional()
  sort?: Sort

  @IsEnum(QueryType)
  @IsOptional()
  type?: QueryType

  @IsOptional()
  @ArrayUnique()
  ids?: string[]

  @IsOptional()
  username: string
}

export class PaginateDto {
  pageCurrent: string
  pageSize: string
}
